import { TranslationModel, TranslationResult } from './translation_model'
import { SecretsManager } from '../secrets_manager'

export class OllamaTranslationProvider implements TranslationModel {
  async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult> {
    const secrets = SecretsManager.getTranslationSecret('ollama')
    const connectionUrl = secrets.connectionUrl || 'http://localhost:11434'
    const model = secrets.additionalParams?.model || 'llama2'

    if (!connectionUrl) {
      throw new Error('Ollama connection URL is required')
    }

    try {
      // Prepare the prompt for translation
      let prompt = `Translate the following text to ${options.targetLanguage}:\n\n${text}\n\nTranslation:`

      // Add source language information if available
      if (options.sourceLanguage) {
        prompt = `Translate the following text from ${options.sourceLanguage} to ${options.targetLanguage}:\n\n${text}\n\nTranslation:`
      }

      // Add context if provided
      if (options.context) {
        prompt += `\n\nContext: ${options.context}`
      }

      // Prepare the request body
      const requestBody = {
        model,
        prompt,
        stream: false
      }

      // Call the Ollama API
      const response = await fetch(`${connectionUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const result = await response.json()

      // Extract the translation from the response
      let translatedText = result.response || ''

      // Clean up the response to remove any non-translation text
      translatedText = translatedText.trim()

      // Ollama might include "Translation:" in the response, let's remove it
      if (translatedText.toLowerCase().startsWith('translation:')) {
        translatedText = translatedText.substring('translation:'.length).trim()
      }

      return {
        translatedText,
        detectedSourceLanguage: options.sourceLanguage,
        confidence: undefined // Ollama doesn't provide confidence scores
      }
    } catch (error) {
      console.error('Ollama Translation error:', error)
      throw new Error(
        `Ollama Translation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  getProviderName(): string {
    return 'ollama'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getTranslationSecret('ollama')
    return !!secrets.connectionUrl
  }
}
