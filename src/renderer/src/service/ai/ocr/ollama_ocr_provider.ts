import { OcrModel, OcrResult } from './ocr_model'
import { SecretsManager } from '../secrets_manager'
import { prompt1, simpleOcrPrompt } from './prompts'

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
        // If it's a data URL, extract only the base64 part
        if (imageData.startsWith('data:image')) {
          base64Image = imageData.substring(imageData.indexOf(',') + 1)
        } else {
          base64Image = imageData // assume it's already base64
        }
      } else {
        // Convert Blob or File to base64 string (strip data URL prefix)
        const dataUrl = await this.blobToDataUrl(imageData)
        base64Image = dataUrl.substring(dataUrl.indexOf(',') + 1)
      }

      // Use the advanced OCR prompt from prompts.ts
      let prompt: string
      // Use simple prompt if model has few parameters (e.g., quantized, 4b, 2b, etc.)
      const lowerModel = model.toLowerCase()
      if (
        lowerModel.includes('4b') ||
        lowerModel.includes('2b') ||
        lowerModel.includes('3b') ||
        lowerModel.includes('quant') ||
        lowerModel.includes('tiny') ||
        lowerModel.includes('small')
      ) {
        prompt = simpleOcrPrompt
      } else {
        prompt = prompt1
      }
      if (options?.language) {
        // Optionally append language info if available, but keep it simple
        prompt += ` The text is in ${options.language}.`
      }

      const requestBody = {
        model,
        prompt,
        images: [base64Image],
        stream: false
      }

      // Add a timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 180s timeout
      try {
        const response = await fetch(`${connectionUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`)
        }
        const result = await response.json()
        const extractedText = result.response || ''
        return {
          text: extractedText.trim(),
          confidence: undefined,
          language: options?.language,
          boundingBoxes: undefined
        }
      } catch (error) {
        clearTimeout(timeoutId)
        function isAbortError(e: unknown): e is { name: string } {
          return (
            !!e &&
            typeof e === 'object' &&
            'name' in e &&
            (e as { name: string }).name === 'AbortError'
          )
        }
        if (isAbortError(error)) {
          throw new Error(
            'Ollama OCR processing timed out. The model may be loading or is slow to respond. Try increasing the timeout or check if the model is ready.'
          )
        }
        throw error
      }
    } catch (error) {
      console.error('Ollama OCR error:', error)
      throw new Error(
        `Ollama OCR processing failed: ${error instanceof Error ? error.message : String(error)}`
      )
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
