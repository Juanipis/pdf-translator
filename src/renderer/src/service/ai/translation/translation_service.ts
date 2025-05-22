import { SecretsManager } from '../secrets_manager'
import { TranslationModel, TranslationResult } from './translation_model'
import { MockTranslationProvider } from './mock_translation_provider'
import { GoogleTranslationProvider } from './google_translation_provider'
import { OllamaTranslationProvider } from './ollama_translation_provider'
import { GeminiTranslationProvider } from './gemini_translation_provider'

export class TranslationService {
  private static instance: TranslationService
  private providers: Map<string, TranslationModel> = new Map()

  private constructor() {
    // Register available providers
    this.registerProvider(new MockTranslationProvider())
    this.registerProvider(new GoogleTranslationProvider())
    this.registerProvider(new OllamaTranslationProvider())
    this.registerProvider(new GeminiTranslationProvider())
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService()
    }
    return TranslationService.instance
  }

  private registerProvider(provider: TranslationModel): void {
    this.providers.set(provider.getProviderName(), provider)
  }

  public async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult> {
    const selectedProvider = SecretsManager.getSelectedTranslationProvider()
    let provider = this.providers.get(selectedProvider)

    if (!provider) {
      throw new Error(`Translation provider '${selectedProvider}' not found`)
    }

    const isReady = await provider.isReady()
    if (!isReady) {
      // Fallback to mock provider if selected provider is not ready
      console.warn(`Translation provider '${selectedProvider}' is not ready. Falling back to mock provider.`)
      provider = this.providers.get('mock')
      if (!provider) {
        throw new Error('No translation provider available. Mock provider not found.')
      }
    }

    return provider.translateText(text, options)
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  public getCurrentProvider(): string {
    return SecretsManager.getSelectedTranslationProvider()
  }

  public setCurrentProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`Translation provider '${providerName}' not found`)
    }
    SecretsManager.setSelectedTranslationProvider(providerName)
  }

  public getProviderConfigFields(
    providerName: string
  ): { key: string; type: string; required: boolean; label: string }[] {
    switch (providerName) {
      case 'google':
        return [{ key: 'apiKey', type: 'password', required: true, label: 'API Key' }]
      case 'ollama':
        return [
          { key: 'connectionUrl', type: 'text', required: true, label: 'Endpoint URL' },
          { key: 'additionalParams.model', type: 'text', required: false, label: 'Model Name' }
        ]
      case 'gemini':
        return [
          { key: 'apiKey', type: 'password', required: true, label: 'API Key' },
          { key: 'model', type: 'text', required: true, label: 'Model' }
        ]
      case 'mock':
        return []
      default:
        return [{ key: 'apiKey', type: 'password', required: true, label: 'API Key' }]
    }
  }
}
