import { SecretsManager } from '../secrets_manager'
import { OcrModel, OcrResult } from './ocr_model'
import { MockOcrProvider } from './mock_ocr_provider'
import { GoogleOcrProvider } from './google_ocr_provider'
import { OllamaOcrProvider } from './ollama_ocr_provider'
import { GeminiOcrProvider } from './gemini_ocr_provider'

export class OcrService {
  private static instance: OcrService
  private providers: Map<string, OcrModel> = new Map()

  private constructor() {
    // Register available providers
    this.registerProvider(new MockOcrProvider())
    this.registerProvider(new GoogleOcrProvider())
    this.registerProvider(new GeminiOcrProvider())
    this.registerProvider(new OllamaOcrProvider())
  }

  public static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService()
    }
    return OcrService.instance
  }

  private registerProvider(provider: OcrModel): void {
    this.providers.set(provider.getProviderName(), provider)
  }

  public async processImage(
    imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
    }
  ): Promise<OcrResult> {
    const selectedProvider = SecretsManager.getSelectedOcrProvider()
    let provider = this.providers.get(selectedProvider)
    console.log(
      `Selected OCR provider: ${selectedProvider}, Available providers: ${Array.from(
        this.providers.keys()
      )}`
    )

    if (!provider) {
      throw new Error(`OCR provider '${selectedProvider}' not found`)
    }

    const isReady = await provider.isReady()
    if (!isReady) {
      // Fallback to mock provider if selected provider is not ready
      console.warn(
        `OCR provider '${selectedProvider}' is not ready. Falling back to mock provider.`
      )
      provider = this.providers.get('mock')
      if (!provider) {
        throw new Error('No OCR provider available. Mock provider not found.')
      }
    }

    return provider.processImage(imageData, options)
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  public getCurrentProvider(): string {
    return SecretsManager.getSelectedOcrProvider()
  }

  public setCurrentProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`OCR provider '${providerName}' not found`)
    }
    SecretsManager.setSelectedOcrProvider(providerName)
  }

  public getProviderConfigFields(
    providerName: string
  ): { key: string; type: string; required: boolean; label: string }[] {
    switch (providerName) {
      case 'google':
        return [{ key: 'apiKey', type: 'password', required: true, label: 'API Key' }]
      case 'azure':
        return [
          { key: 'apiKey', type: 'password', required: true, label: 'API Key' },
          { key: 'connectionUrl', type: 'text', required: true, label: 'Endpoint URL' }
        ]
      case 'ollama':
        return [
          { key: 'connectionUrl', type: 'text', required: true, label: 'Endpoint URL' },
          { key: 'additionalParams.model', type: 'text', required: false, label: 'Model Name' }
        ]
      case 'mock':
        return []

      case 'gemini':
        return [
          { key: 'apiKey', type: 'password', required: true, label: 'API Key' },
          { key: 'model', type: 'text', required: true, label: 'Model' }
        ]
      default:
        return [{ key: 'apiKey', type: 'password', required: true, label: 'API Key' }]
    }
  }
}
