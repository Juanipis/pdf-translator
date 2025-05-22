import { OcrModel, OcrResult } from './ocr_model'
import { SecretsManager } from '../secrets_manager'

export class OllamaOcrProvider implements OcrModel {
  async processImage(
    imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
    }
  ): Promise<OcrResult> {
    const secrets = SecretsManager.getOcrSecret('ollama')
    const connectionUrl = secrets.connectionUrl || 'http://localhost:11434'
    const model = secrets.additionalParams?.model || 'llava'

    try {
      // Convert image data to base64 if it's not already
      let base64Image: string
      if (typeof imageData === 'string') {
        // Check if it's already a data URL
        if (imageData.startsWith('data:image')) {
          base64Image = imageData
        } else {
          base64Image = `data:image/jpeg;base64,${imageData}`
        }
      } else {
        // Convert Blob or File to base64
        base64Image = await this.blobToDataUrl(imageData)
      }

      // Prepare the request to Ollama
      let prompt =
        'Extract all visible text from this image. Return only the text content without any comments or analysis.'

      if (options?.language) {
        prompt += ` The text is in ${options.language}.`
      }

      const requestBody = {
        model,
        prompt,
        images: [base64Image],
        stream: false
      }

      // Call the Ollama API
      const response = await fetch(`${connectionUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const result = await response.json()

      // Extract the text from the response
      const extractedText = result.response || ''

      return {
        text: extractedText.trim(),
        // Ollama doesn't provide confidence scores or bounding boxes
        confidence: undefined,
        language: options?.language,
        boundingBoxes: undefined
      }
    } catch (error) {
      console.error('Ollama OCR error:', error)
      throw new Error(`Ollama OCR processing failed: ${error.message}`)
    }
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  getProviderName(): string {
    return 'ollama'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getOcrSecret('ollama')
    // Ollama just needs a connection URL to be ready
    return !!secrets.connectionUrl
  }
}
