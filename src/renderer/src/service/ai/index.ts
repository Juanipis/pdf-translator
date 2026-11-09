// Export OCR services
export * from './ocr/ocr_model'
export * from './ocr/ocr_service'

// Export translation services
export * from './translation/translation_model'
export * from './translation/translation_service'

// Export secrets manager
export * from './secrets_manager'

// Convenience function to get service instances
import { OcrService } from './ocr/ocr_service'
import { TranslationService } from './translation/translation_service'

export const getOcrService = (): OcrService => OcrService.getInstance()
export const getTranslationService = (): TranslationService => TranslationService.getInstance()
