import { TranslationModel, TranslationResult } from './translation_model'

export class MockTranslationProvider implements TranslationModel {
  async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a mock translation
    let translatedText = `[${options.targetLanguage.toUpperCase()}] ${text}`

    // For Spanish, add some basic translation as an example
    if (options.targetLanguage === 'es') {
      translatedText = text
        .replace(/hello/gi, 'hola')
        .replace(/goodbye/gi, 'adiós')
        .replace(/thank you/gi, 'gracias')
        .replace(/please/gi, 'por favor')
        .replace(/the/gi, 'el')
        .replace(/is/gi, 'es')
        .replace(/are/gi, 'son')
        .replace(/you/gi, 'tú')
        .replace(/I/g, 'yo')
        .replace(/and/gi, 'y')
    }

    return {
      translatedText,
      detectedSourceLanguage: options.sourceLanguage || 'en',
      confidence: 0.9 // Mock confidence level
    }
  }

  getProviderName(): string {
    return 'mock'
  }

  async isReady(): Promise<boolean> {
    return true // Mock is always ready
  }
}
