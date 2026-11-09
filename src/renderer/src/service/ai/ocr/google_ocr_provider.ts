import { OcrModel, OcrResult } from './ocr_model'
import { SecretsManager } from '../secrets_manager'

export class GoogleOcrProvider implements OcrModel {
  async processImage(
    imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
    }
  ): Promise<OcrResult> {
    const secrets = SecretsManager.getOcrSecret('google')
    const apiKey = secrets.apiKey

    if (!apiKey) {
      throw new Error('Google Cloud Vision API Key is required')
    }

    try {
      // Convert image data to base64 if it's not already
      let base64Image: string
      if (typeof imageData === 'string') {
        // Check if it's already a data URL
        if (imageData.startsWith('data:image')) {
          base64Image = imageData.split(',')[1]
        } else {
          base64Image = imageData
        }
      } else {
        // Convert Blob or File to base64
        base64Image = await this.blobToBase64(imageData)
      }

      // Prepare the request body
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ],
            imageContext: {
              languageHints: options?.language ? [options.language] : []
            }
          }
        ]
      }

      // Call the Google Cloud Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        throw new Error(`Google OCR API error: ${response.statusText}`)
      }

      const result = await response.json()

      // Extract text from the response
      if (!result.responses || !result.responses[0] || !result.responses[0].textAnnotations) {
        return { text: '' }
      }

      const textAnnotations = result.responses[0].textAnnotations
      const fullText = textAnnotations[0].description

      // Process bounding boxes if requested
      let boundingBoxes
      if (options?.returnBoundingBoxes && textAnnotations.length > 1) {
        boundingBoxes = textAnnotations.slice(1).map((annotation) => {
          const vertices = annotation.boundingPoly.vertices
          const x = Math.min(...vertices.map((v) => v.x))
          const y = Math.min(...vertices.map((v) => v.y))
          const maxX = Math.max(...vertices.map((v) => v.x))
          const maxY = Math.max(...vertices.map((v) => v.y))

          return {
            x,
            y,
            width: maxX - x,
            height: maxY - y,
            text: annotation.description
          }
        })
      }

      return {
        text: fullText,
        confidence: result.responses[0].textAnnotations[0].confidence,
        language: result.responses[0].textAnnotations[0].locale,
        boundingBoxes
      }
    } catch (error) {
      console.error('Google OCR error:', error)
      throw new Error(
        `Google OCR processing failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        // Extract the base64 part without the data URL prefix
        const base64 = base64String.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  getProviderName(): string {
    return 'google'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getOcrSecret('google')
    return !!secrets.apiKey
  }
}
