import { SecretsManager } from '../secrets_manager'
import { OcrModel, OcrResult } from './ocr_model'
import { GoogleGenAI } from '@google/genai'

const prompt = `You are an advanced Optical Character Recognition (OCR) service. Your goal is to accurately extract ALL discernible text from the provided image and structure it as a single, cohesive Markdown document.

**Key Instructions:**

1.  **Content Types & Markdown Formatting**:
    *   **Headings/Titles (H1-H4)**: Identify text that appears to be a heading or title based on its visual prominence (e.g., larger font size, bolding, centered position, distinct separation from other text). Format these as Markdown headings, using appropriate levels from H1 to H4 (e.g., '# Main Title', '## Section Title', '### Subsection Title', '#### Minor Heading').
    *   **Paragraphs**: Extract plain text content as paragraphs. Preserve original line breaks within these text blocks if they represent distinct lines or paragraph breaks.
    *   **Tables**:
        *   Identify distinct tables within the image.
        *   For each table, convert it into a well-formed Markdown table.
        *   Each row from the image table MUST become a single line in the Markdown table source code. For example, an image row with "Cell A | Cell B | Cell C" should become "| Cell A | Cell B | Cell C |" in the Markdown.
        *   Ensure the Markdown table includes a header row and a separator line (e.g., "| Header 1 | Header 2 | \\n |---|---|").
    *   **Vertical Text**: Pay close attention to text orientation. If you encounter vertical text (rotated 90 degrees clockwise or counter-clockwise), attempt to read and correctly orient it. Integrate this text logically into the Markdown document, perhaps as separate paragraphs or notes, typically after any primary content it relates to or at the end if it seems like metadata (e.g., author names, page numbers in a margin).

2.  **Output Requirements**:
    *   The entire output MUST be a single string containing valid Markdown.
    *   Maintain the relative order of elements (headings, paragraphs, tables, rotated text) as they appear in or relate to the image.
    *   If no text is clearly discernible in the image, you MUST return an empty string for the 'extractedMarkdown' field.
    *   Do not add any commentary, explanations, or text that is not part of the extracted content or its Markdown formatting. Be meticulous; try to capture all text, including headers, footers, and text in margins if they are part of the selected region.`

export class GeminiOcrProvider implements OcrModel {
  async processImage(
    imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
      result?: string
    }
  ): Promise<OcrResult> {
    const secrets = SecretsManager.getOcrSecret('gemini')
    const apiKey = secrets.apiKey
    const model = secrets.model || 'gemini-2.0-flash'

    if (!apiKey) {
      throw new Error('Gemini API Key is required')
    }

    try {
      // Initialize the Gemini AI client
      const ai = new GoogleGenAI({ apiKey: apiKey })

      // Convert image data to base64 if needed
      let base64Image: string
      let mimeType: string = 'image/jpeg'

      if (typeof imageData === 'string') {
        // Check if it's already a data URL
        if (imageData.startsWith('data:image')) {
          const [dataUrlPrefix, base64Data] = imageData.split(',')
          base64Image = base64Data
          mimeType = dataUrlPrefix.split(':')[1].split(';')[0]
        } else {
          // It's a base64 string without data URL prefix
          base64Image = imageData
        }
      } else {
        // Convert Blob or File to base64
        const result = await this.blobToBase64(imageData)
        base64Image = result.base64
        mimeType = result.mimeType
      }

      // Prepare the content for Gemini
      const contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        },
        { text: prompt }
      ]

      // Add language-specific instructions if specified
      if (options?.language) {
        contents.push({
          text: `The text in this image is primarily in ${options.language}. Please ensure accurate extraction of text in this language.`
        })
      }

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: model,
        contents: contents
      })

      const extractedText = response.text || ''

      return {
        text: extractedText.trim(),
        confidence: undefined, // Gemini doesn't provide confidence scores
        language: options?.language,
        boundingBoxes: undefined // Gemini doesn't provide bounding boxes in this implementation
      }
    } catch (error) {
      console.error('Gemini OCR error:', error)
      throw new Error(
        `Gemini OCR processing failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private async blobToBase64(blob: Blob): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        const [dataUrlPrefix, base64Data] = dataUrl.split(',')
        const mimeType = dataUrlPrefix.split(':')[1].split(';')[0]
        resolve({ base64: base64Data, mimeType })
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  getProviderName(): string {
    return 'gemini'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getOcrSecret('gemini')
    return !!secrets.apiKey
  }
}
