import { SecretsManager } from '../secrets_manager'
import { OcrModel, OcrResult } from './ocr_model'
import { GoogleGenAI } from '@google/genai'
import { prompt1 } from './prompts'

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
        { text: prompt1 }
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
