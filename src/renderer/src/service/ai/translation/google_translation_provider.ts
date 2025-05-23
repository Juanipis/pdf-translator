import { TranslationModel, TranslationResult } from './translation_model'
import JsGoogleTranslateFree from '@kreisler/js-google-translate-free'

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
    try {
      // Prepare the API URL with parameters

      const translation = await JsGoogleTranslateFree.translate({
        to: options.targetLanguage,
        text
      })

      return {
        translatedText: translation
      }
    } catch (error) {
      console.error('Google Translation error:', error)
      throw new Error(
        `Google Translation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  getProviderName(): string {
    return 'google translate'
  }

  async isReady(): Promise<boolean> {
    return true
  }
}
