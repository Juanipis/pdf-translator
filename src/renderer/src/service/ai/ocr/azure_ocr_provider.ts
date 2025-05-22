import { OcrModel, OcrResult } from './ocr_model'
import { SecretsManager } from '../secrets_manager'

export class AzureOcrProvider implements OcrModel {
  async processImage(
    imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
    }
  ): Promise<OcrResult> {
    const secrets = SecretsManager.getOcrSecret('azure')
    const apiKey = secrets.apiKey
    const endpoint = secrets.connectionUrl

    if (!apiKey || !endpoint) {
      throw new Error('Azure Computer Vision API Key and Endpoint URL are required')
    }

    try {
      // Convert image to proper format
      let imageBlob: Blob
      if (typeof imageData === 'string') {
        // Convert base64 to Blob if needed
        if (imageData.startsWith('data:image')) {
          const byteString = atob(imageData.split(',')[1])
          const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0]
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          imageBlob = new Blob([ab], { type: mimeType })
        } else {
          // It's a base64 string without data URL prefix
          const byteString = atob(imageData)
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          imageBlob = new Blob([ab], { type: 'image/jpeg' })
        }
      } else {
        // It's already a Blob or File
        imageBlob = imageData
      }

      // Build the API URL
      let apiUrl = `${endpoint}/vision/v3.2/read/analyze`
      const params = new URLSearchParams()

      if (options?.language) {
        params.append('language', options.language)
      } else if (options?.detectLanguage) {
        params.append('language', 'auto')
      }

      if (params.toString()) {
        apiUrl += `?${params.toString()}`
      }

      // Call Azure Computer Vision API to start the analyze operation
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': apiKey
        },
        body: imageBlob
      })

      if (!response.ok) {
        throw new Error(`Azure OCR API error: ${response.statusText}`)
      }

      // Get the operation ID from the Operation-Location header
      const operationLocation = response.headers.get('Operation-Location')
      if (!operationLocation) {
        throw new Error('Azure OCR API did not return an operation location')
      }

      // Poll for results
      const result = await this.pollForResults(operationLocation, apiKey)

      if (result.status !== 'succeeded') {
        throw new Error(`Azure OCR operation failed: ${result.status}`)
      }

      // Extract text and bounding boxes
      let text = ''
      const boundingBoxes = []

      if (result.analyzeResult && result.analyzeResult.readResults) {
        for (const page of result.analyzeResult.readResults) {
          for (const line of page.lines) {
            text += line.text + '\n'

            if (options?.returnBoundingBoxes) {
              const { boundingBox } = line
              boundingBoxes.push({
                x: boundingBox[0],
                y: boundingBox[1],
                width: boundingBox[2] - boundingBox[0],
                height: boundingBox[7] - boundingBox[1],
                text: line.text
              } as {
                x: number
                y: number
                width: number
                height: number
                text: string
              })
            }
          }
        }
      }

      return {
        text: text.trim(),
        confidence: 1.0, // Azure doesn't provide an overall confidence score
        language: result.analyzeResult?.readResults[0]?.language,
        boundingBoxes: options?.returnBoundingBoxes ? boundingBoxes : undefined
      }
    } catch (error) {
      console.error('Azure OCR error:', error)
      throw new Error(
        `Azure OCR processing failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private async pollForResults(
    operationLocation: string,
    apiKey: string
  ): Promise<Record<string, unknown>> {
    const maxRetries = 10
    const pollingIntervalMs = 1000

    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs))

      const response = await fetch(operationLocation, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Azure OCR API polling error: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.status === 'succeeded' || result.status === 'failed') {
        return result
      }

      // Continue polling
    }

    throw new Error('Azure OCR operation timed out')
  }

  getProviderName(): string {
    return 'azure'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getOcrSecret('azure')
    return !!secrets.apiKey && !!secrets.connectionUrl
  }
}
