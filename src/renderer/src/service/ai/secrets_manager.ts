export interface AIServiceSecrets {
  apiKey?: string
  connectionUrl?: string
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
    secrets.ocr[provider] = secret
    this.saveSecrets(secrets)
  }

  static setTranslationSecret(provider: string, secret: AIServiceSecrets): void {
    const secrets = this.getSecrets()
    secrets.translation[provider] = secret
    this.saveSecrets(secrets)
  }

  static getSelectedOcrProvider(): string {
    // Check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (window.electron as unknown as Record<string, unknown>)
        .getSettingsService as () => { getOcrProvider: () => string }
      return settingsService().getOcrProvider()
    }

    // Fallback to mock provider for development/demo purposes
    return 'mock'
  }

  static getSelectedTranslationProvider(): string {
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
    // Check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (
        window.electron as unknown as Record<string, Function>
      ).getSettingsService() as { setOcrProvider: (provider: string) => void }
      settingsService.setOcrProvider(provider)
    }
  }

  static setSelectedTranslationProvider(provider: string): void {
    // Check if the electron API and method exists
    if (window.electron && 'getSettingsService' in window.electron) {
      const settingsService = (
        window.electron as unknown as Record<string, Function>
      ).getSettingsService() as { setTranslationProvider: (provider: string) => void }
      settingsService.setTranslationProvider(provider)
    }
  }
}
