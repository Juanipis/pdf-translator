// Export AI services
export * from './ai'
export * from './settings/settings_service'

// Convenience functions to get service instances
import { OcrService } from './ai/ocr/ocr_service'
import { TranslationService } from './ai/translation/translation_service'
import { SettingsService } from './settings/settings_service'

export const getOcrService = (): OcrService => OcrService.getInstance()
export const getTranslationService = (): TranslationService => TranslationService.getInstance()
export const getSettingsService = (): SettingsService => SettingsService.getInstance()
