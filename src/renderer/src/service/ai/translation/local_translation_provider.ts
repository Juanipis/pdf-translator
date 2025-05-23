import { TranslationModel, TranslationResult } from './translation_model'
import { SecretsManager } from '../secrets_manager'
// Import pipeline and env from Transformers.js
import { pipeline, env } from '@xenova/transformers';

// Define a constant for the provider name
const PROVIDER_NAME = 'local_transformers_translation';

export class LocalTranslationProvider implements TranslationModel {
  private translationPipeline: any = null; // To store the initialized pipeline
  private modelsPath: string | null = null;
  private modelName = 'Xenova/nllb-200-distilled-600M'; // Default or make configurable

  constructor() {
    // Initialize modelsPath from SecretsManager
    this.modelsPath = SecretsManager.getTranslationSecret(PROVIDER_NAME)?.modelsPath || null;
  }

  getProviderName(): string {
    return PROVIDER_NAME;
  }

  async isReady(): Promise<boolean> {
    this.modelsPath = SecretsManager.getTranslationSecret(PROVIDER_NAME)?.modelsPath || null;
    if (!this.modelsPath || this.modelsPath.trim() === '') {
      console.warn('Local Translation Provider: Models path is not configured.');
      return false;
    }
    // For now, a configured path is sufficient.
    return true;
  }

  private async initializePipeline(sourceLanguage?: string, targetLanguage?: string): Promise<void> {
    if (this.translationPipeline) {
      // TODO: Consider if pipeline needs re-initialization if languages change significantly
      // For now, assume one pipeline instance is okay or it handles dynamic languages.
      // NLLB models are multilingual, so this should be fine.
      return;
    }

    if (!await this.isReady()) {
        throw new Error('Local Translation Provider is not ready. Configure models path.');
    }

    // Configure Transformers.js environment
    env.localModelPath = this.modelsPath!;
    env.allowRemoteModels = false;
    // Path relative to the app's resources/root where 'public/wasm-ort/' would be.
    // This assumes the 'public' directory is copied to the app's root during packaging.
    env.backends.onnx.wasm.wasmPaths = './wasm-ort/';

    try {
      // Initialize the translation pipeline
      // TODO: This part should ideally be executed in a Web Worker (Step 9)
      console.log(`Initializing Translation pipeline with model: ${this.modelName} from path: ${this.modelsPath}`);
      // For NLLB, task is 'translation_xx_to_yy' if src/tgt known, or generic 'translation'
      // and specify src_lang, tgt_lang during the call.
      // We will use the latter approach for flexibility.
      this.translationPipeline = await pipeline('translation', this.modelName);
      console.log('Local Translation pipeline initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Local Translation pipeline:', error);
      this.translationPipeline = null; // Reset pipeline on error
      throw error; // Re-throw the error
    }
  }

  async translateText(
    text: string,
    options: {
      sourceLanguage?: string
      targetLanguage: string
      format?: 'text' | 'html' // Format might not be directly applicable to all models
      context?: string // Context might not be directly applicable
    }
  ): Promise<TranslationResult> {
    if (!this.translationPipeline) {
      // Pass languages if available, though NLLB might infer or use a general model
      await this.initializePipeline(options.sourceLanguage, options.targetLanguage);
    }

    if (!this.translationPipeline) {
        throw new Error('Local Translation pipeline is not available.');
    }

    // TODO: Implement Web Worker communication here (Step 9)
    // For now, direct call for simplicity
    try {
      console.log('Translating text with Local Translation provider...');
      // NLLB expects src_lang and tgt_lang to be passed in the call itself.
      // Format: ISO 639-1 codes for many common languages, or specific NLLB codes for others.
      // Example: 'eng_Latn' for English, 'fra_Latn' for French, 'spa_Latn' for Spanish.
      // The pipeline will need to know how to map simpler codes (e.g., 'en', 'es') if we use those.
      // For now, assume options.sourceLanguage and options.targetLanguage are in a format the model understands.
      const result = await this.translationPipeline(text, {
        src_lang: options.sourceLanguage, // e.g., 'eng_Latn' or 'en' if tokenizer handles it
        tgt_lang: options.targetLanguage, // e.g., 'fra_Latn' or 'fr'
      });
      
      console.log('Local Translation complete.');
      // Adapt the result to the TranslationResult interface
      // Transformers.js output for translation is typically an array of objects:
      // [{ translation_text: "translated text" }]
      // We'll take the first result.
      const translatedText = result && result.length > 0 ? result[0].translation_text : '';
      return {
        translatedText: translatedText,
        // detectedSourceLanguage and confidence might not be available from all models
      };
    } catch (error) {
      console.error('Error during Local Translation processing:', error);
      throw error;
    }
  }
}
