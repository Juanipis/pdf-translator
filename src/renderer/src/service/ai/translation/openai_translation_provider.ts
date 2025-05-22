import { TranslationModel, TranslationResult } from './translation_model'
import { SecretsManager } from '../secrets_manager'

export class OpenAITranslationProvider implements TranslationModel {
  async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult> {
    const secrets = SecretsManager.getTranslationSecret('openai')
    const apiKey = secrets.apiKey
    const model = secrets.additionalParams?.model || 'gpt-3.5-turbo'

    if (!apiKey) {
      throw new Error('OpenAI API Key is required')
    }

    try {
      // Prepare the system message for translation
      let systemMessage = `You are a professional translator. Translate the provided text to ${options.targetLanguage} language. Preserve formatting. Only respond with the translation, nothing else.`

      if (options.sourceLanguage) {
        systemMessage = `You are a professional translator. Translate the provided text from ${options.sourceLanguage} to ${options.targetLanguage} language. Preserve formatting. Only respond with the translation, nothing else.`
      }

      // Prepare context information if available
      let userMessage = text
      if (options.context) {
        userMessage = `Context: ${options.context}\n\nText to translate: ${text}`
      }

      // Prepare the request body
      const requestBody = {
        model,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.3 // Lower temperature for more accurate translations
      }

      // Call the OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No translation data received from OpenAI API')
      }

      const translatedText = result.choices[0].message.content.trim()

      return {
        translatedText,
        detectedSourceLanguage: options.sourceLanguage,
        // OpenAI doesn't provide confidence scores directly, but we can use a proxy based on the model
        confidence: undefined
      }
    } catch (error) {
      console.error('OpenAI Translation error:', error)
      throw new Error(
        `OpenAI Translation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  getProviderName(): string {
    return 'openai'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getTranslationSecret('openai')
    return !!secrets.apiKey
  }
}
