export interface TranslationResult {
  translatedText: string
  detectedSourceLanguage?: string
  confidence?: number
}

export interface TranslationModel {
  /**
   * Translate text from one language to another
   * @param text - Text to translate
   * @param options - Translation options
   * @returns Promise with translation result
   */
  translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult>

  /**
   * Get the provider name
   */
  getProviderName(): string

  /**
   * Check if the model is ready to use (e.g., has valid API keys)
   */
  isReady(): Promise<boolean>
}
