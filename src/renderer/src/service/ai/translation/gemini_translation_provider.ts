import { SecretsManager } from '../secrets_manager'
import { TranslationModel, TranslationResult } from './translation_model'
import { GoogleGenAI } from '@google/genai'

const prompt = `You are an advanced translation service. Your task is to accurately translate the provided text from the source language to the target language while preserving the original meaning, tone, and format.

**Key Instructions:**

1. **Translation Quality**:
   * Maintain the original meaning and context of the text.
   * Preserve the original tone (formal, casual, technical, etc.).
   * Keep idiomatic expressions natural in the target language.
   * Maintain proper formatting such as paragraphs, bullet points, and headings.

2. **Specialized Content**:
   * For technical content: Ensure accurate translation of technical terms and maintain consistency.
   * For creative content: Preserve the style and flow while making it sound natural in the target language.

3. **Output Requirements**:
   * Provide only the translated text without explanations or comments.
   * Preserve the original formatting (line breaks, bullet points, etc.).
   * If HTML format is specified, ensure HTML tags are preserved exactly as in the original.

Translate the following text from {sourceLanguage} to {targetLanguage}:`

export class GeminiTranslationProvider implements TranslationModel {
  async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html'
      context?: string
    }
  ): Promise<TranslationResult> {
    const secrets = SecretsManager.getTranslationSecret('gemini')
    const apiKey = secrets.apiKey
    const model = secrets.model || 'gemini-2.0-flash'

    if (!apiKey) {
      throw new Error('Gemini API Key is required')
    }

    try {
      // Initialize the Gemini AI client
      const ai = new GoogleGenAI({ apiKey: apiKey })

      // Build the complete prompt
      let customPrompt = prompt.replace('{targetLanguage}', options.targetLanguage)

      // If source language is provided, use it; otherwise instruct to detect
      if (options.sourceLanguage) {
        customPrompt = customPrompt.replace('{sourceLanguage}', options.sourceLanguage)
      } else {
        customPrompt = customPrompt.replace('from {sourceLanguage}', 'from the detected language')
      }

      // Add format-specific instructions
      if (options.format === 'html') {
        customPrompt +=
          '\n\nImportant: This text contains HTML markup. Preserve all HTML tags exactly as they appear in the original text.'
      }

      // Add context if provided
      if (options.context) {
        customPrompt += `\n\nContext for translation: ${options.context}`
      }

      // Prepare contents for the API call
      const contents = [{ text: customPrompt }, { text: text }]

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: model,
        contents: contents
      })

      const translatedText = response.text || ''

      return {
        translatedText: translatedText.trim(),
        detectedSourceLanguage: options.sourceLanguage,
        confidence: undefined // Gemini doesn't provide confidence scores
      }
    } catch (error) {
      console.error('Gemini translation error:', error)
      throw new Error(
        `Gemini translation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  getProviderName(): string {
    return 'gemini'
  }

  async isReady(): Promise<boolean> {
    const secrets = SecretsManager.getTranslationSecret('gemini')
    return !!secrets.apiKey
  }
}
