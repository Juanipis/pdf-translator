import { TranslationModel, TranslationResult } from './translation_model'
import { SecretsManager } from '../secrets_manager'

export class GoogleTranslationProvider implements TranslationModel {
  async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult> {
    const secrets = SecretsManager.getTranslationSecret('google')
    const apiKey = secrets.apiKey

    if (!apiKey) {
      throw new Error('Google Cloud Translation API Key is required')
    }

    try {
      // Prepare the API URL with parameters
      const apiUrl = 'https://translation.googleapis.com/language/translate/v2'
      const params = new URLSearchParams({
        key: apiKey,
        q: text,
        target: options.targetLanguage,
        format: options.format || 'text'
      })

      // Add source language if provided
      if (options.sourceLanguage) {
        params.append('source', options.sourceLanguage)
      }

      // Call the Google Translation API
      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Google Translation API error: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.data || !result.data.translations || result.data.translations.length === 0) {
        throw new Error('No translation data received from Google API')
      }

      const translation = result.data.translations[0]

      return {
        translatedText: translation.translatedText,
        detectedSourceLanguage: translation.detectedSourceLanguage,
        confidence: undefined // Google doesn't provide confidence scores for translations
      }
    } catch (error) {
      console.error('Google Translation error:', error)
      throw new Error(
        `Google Translation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  getProviderName(): string {
    return 'google'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getTranslationSecret('google')
    return !!secrets.apiKey
  }
}
