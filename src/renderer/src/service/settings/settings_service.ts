export interface AppSettings {
  language: string
  theme: 'light' | 'dark' | 'system'
  autoTranslate: boolean
  appearance: {
    showPageNumbers: boolean
    highlightExtractedText: boolean
    showToolbar: boolean
  }
  ai: {
    ocrProvider: string
    translationProvider: string
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
  autoTranslate: false,
  appearance: {
    showPageNumbers: true,
    highlightExtractedText: true,
    showToolbar: true
  },
  ai: {
    ocrProvider: 'google', // Default OCR provider
    translationProvider: 'google' // Default translation provider
  }
}

export class SettingsService {
  private static readonly STORAGE_KEY = 'app_settings'
  private static instance: SettingsService

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  public getSettings(): AppSettings {
    const storedData = localStorage.getItem(SettingsService.STORAGE_KEY)
    if (!storedData) {
      return DEFAULT_SETTINGS
    }

    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(storedData) } as AppSettings
    } catch (error) {
      console.error('Failed to parse stored settings', error)
      return DEFAULT_SETTINGS
    }
  }

  public saveSettings(settings: Partial<AppSettings>): void {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    localStorage.setItem(SettingsService.STORAGE_KEY, JSON.stringify(updatedSettings))
  }

  public getLanguage(): string {
    return this.getSettings().language
  }

  public setLanguage(language: string): void {
    this.saveSettings({ language })
  }

  public getTheme(): 'light' | 'dark' | 'system' {
    return this.getSettings().theme
  }

  public setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.saveSettings({ theme })
  }

  public getAutoTranslate(): boolean {
    return this.getSettings().autoTranslate
  }

  public setAutoTranslate(autoTranslate: boolean): void {
    this.saveSettings({ autoTranslate })
  }

  public getAppearanceSettings(): AppSettings['appearance'] {
    return this.getSettings().appearance
  }

  public updateAppearanceSettings(appearance: Partial<AppSettings['appearance']>): void {
    const currentSettings = this.getSettings()
    this.saveSettings({
      appearance: { ...currentSettings.appearance, ...appearance }
    })
  }

  public getAISettings(): AppSettings['ai'] {
    return this.getSettings().ai
  }

  public updateAISettings(ai: Partial<AppSettings['ai']>): void {
    const currentSettings = this.getSettings()
    this.saveSettings({
      ai: { ...currentSettings.ai, ...ai }
    })
  }

  public getOcrProvider(): string {
    return this.getSettings().ai.ocrProvider
  }

  public setOcrProvider(provider: string): void {
    const currentSettings = this.getSettings()
    this.saveSettings({
      ai: { ...currentSettings.ai, ocrProvider: provider }
    })
  }

  public getTranslationProvider(): string {
    return this.getSettings().ai.translationProvider
  }

  public setTranslationProvider(provider: string): void {
    const currentSettings = this.getSettings()
    this.saveSettings({
      ai: { ...currentSettings.ai, translationProvider: provider }
    })
  }
}
