import { TranslationModel, TranslationResult } from './translation_model'
import { SecretsManager } from '../secrets_manager'
import { prompt1 } from './prompts'

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
      let customPrompt = prompt1.replace('{targetLanguage}', options.targetLanguage)
      if (options.format === 'html') {
        customPrompt +=
          '\n\nImportant: This text contains HTML markup. Preserve all HTML tags exactly as they appear in the original text.'
      }
      // Add the text to translate after the prompt
      const fullPrompt = `${customPrompt}\n\n${text}`

      // Prepare the request body with the correct field
      const requestBody = {
        model,
        prompt: fullPrompt,
        stream: false
      }

      // Add a timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout
      try {
        const response = await fetch(`${connectionUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`)
        }
        const result = await response.json()
        let translatedText = result.response || ''
        translatedText = translatedText.trim()
        if (translatedText.toLowerCase().startsWith('translation:')) {
          translatedText = translatedText.substring('translation:'.length).trim()
        }
        return {
          translatedText,
          detectedSourceLanguage: options.sourceLanguage,
          confidence: undefined // Ollama doesn't provide confidence scores
        }
      } finally {
        clearTimeout(timeoutId)
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
