export interface AIServiceSecrets {
  apiKey?: string
  connectionUrl?: string
  model?: string
  additionalParams?: Record<string, string>
}

export interface AISecrets {
  ocr: {
    [provider: string]: AIServiceSecrets
  }
  translation: {
    [provider: string]: AIServiceSecrets
  }
}

const DEFAULT_SECRETS: AISecrets = {
  ocr: {
    google: {},
    gemini: {},
    azure: {},
    ollama: { connectionUrl: 'http://localhost:11434' },
    amazon: {},
    mock: {}
  },
  translation: {
    google: {},
    azure: {},
    ollama: { connectionUrl: 'http://localhost:11434' },
    openai: {},
    mock: {}
  }
}

const OCR_PROVIDER_STORAGE_KEY = 'selected_ocr_provider'
const TRANSLATION_PROVIDER_STORAGE_KEY = 'selected_translation_provider'

export class SecretsManager {
  private static readonly STORAGE_KEY = 'ai_service_secrets'

  static getSecrets(): AISecrets {
    const storedData = localStorage.getItem(this.STORAGE_KEY)
    if (!storedData) {
      return DEFAULT_SECRETS
    }

    try {
      // Merge with defaults to ensure new providers are added
      const parsed = JSON.parse(storedData) as AISecrets
      return {
        ocr: { ...DEFAULT_SECRETS.ocr, ...parsed.ocr },
        translation: { ...DEFAULT_SECRETS.translation, ...parsed.translation }
      }
    } catch (error) {
      console.error('Failed to parse stored secrets', error)
      return DEFAULT_SECRETS
    }
  }

  static saveSecrets(secrets: AISecrets): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(secrets))
  }

  static getOcrSecret(provider: string): AIServiceSecrets {
    const secrets = this.getSecrets()
    return secrets.ocr[provider] || {}
  }

  static getTranslationSecret(provider: string): AIServiceSecrets {
    const secrets = this.getSecrets()
    return secrets.translation[provider] || {}
  }

  static setOcrSecret(provider: string, secret: AIServiceSecrets): void {
    const secrets = this.getSecrets()
    secrets.ocr[provider] = this.validateAndNormalizeSecrets(secret)
    this.saveSecrets(secrets)
  }

  static setTranslationSecret(provider: string, secret: AIServiceSecrets): void {
    const secrets = this.getSecrets()
    secrets.translation[provider] = this.validateAndNormalizeSecrets(secret)
    this.saveSecrets(secrets)
  }

  // Improved method to validate and normalize connection URLs
  private static validateAndNormalizeSecrets(secret: AIServiceSecrets): AIServiceSecrets {
    const normalizedSecret = { ...secret }

    // Ensure connection URL has proper format if provided
    if (normalizedSecret.connectionUrl) {
      try {
        // Remove trailing slashes for consistency
        let url = normalizedSecret.connectionUrl.trim().replace(/\/+$/, '')

        // Handle localhost special case - make sure it has a protocol
        if (url.match(/^localhost(:\d+)?($|\/)/)) {
          url = 'http://' + url
        } else if (url.match(/^127\.0\.0\.1(:\d+)?($|\/)/)) {
          url = 'http://' + url
        }

        // Check if it's a valid URL
        new URL(url)
        normalizedSecret.connectionUrl = url
      } catch (e) {
        console.warn('Invalid connection URL provided:', normalizedSecret.connectionUrl)
        // Keep the original value, app will handle connection errors gracefully
      }
    }

    return normalizedSecret
  }

  static getSelectedOcrProvider(): string {
    // First check localStorage for the most recent selection
    const storedProvider = localStorage.getItem(OCR_PROVIDER_STORAGE_KEY)
    if (storedProvider) {
      return storedProvider
    }

    // Then check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (window.electron as unknown as Record<string, unknown>)
        .getSettingsService as () => { getOcrProvider: () => string }
      return settingsService().getOcrProvider()
    }

    // Fallback to mock provider for development/demo purposes
    return 'mock'
  }

  static getSelectedTranslationProvider(): string {
    // First check localStorage for the most recent selection
    const storedProvider = localStorage.getItem(TRANSLATION_PROVIDER_STORAGE_KEY)
    if (storedProvider) {
      return storedProvider
    }

    // Check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (window.electron as unknown as Record<string, unknown>)
        .getSettingsService as () => { getTranslationProvider: () => string }
      return settingsService().getTranslationProvider()
    }

    // Fallback to mock provider for development/demo purposes
    return 'mock'
  }

  static setSelectedOcrProvider(provider: string): void {
    // Store in localStorage for immediate effect
    localStorage.setItem(OCR_PROVIDER_STORAGE_KEY, provider)

    // Check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (
        window.electron as unknown as Record<string, Function>
      ).getSettingsService() as { setOcrProvider: (provider: string) => void }
      settingsService.setOcrProvider(provider)
    }
  }

  static setSelectedTranslationProvider(provider: string): void {
    // Store in localStorage for immediate effect
    localStorage.setItem(TRANSLATION_PROVIDER_STORAGE_KEY, provider)

    // Check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (
        window.electron as unknown as Record<string, Function>
      ).getSettingsService() as { setTranslationProvider: (provider: string) => void }
      settingsService.setTranslationProvider(provider)
    }
  }
}
