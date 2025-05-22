import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getSettingsService,
  SecretsManager,
  getOcrService,
  getTranslationService
} from '../service'

export interface UseSettingsReturn {
  // Language settings
  language: string
  handleLanguageChange: (value: string) => void

  // Auto translate setting
  autoTranslate: boolean
  handleAutoTranslateChange: (value: boolean) => void

  // Appearance settings
  appearance: Record<string, boolean>
  handleAppearanceChange: (key: string, value: boolean) => void

  // AI provider settings
  ocrProvider: string
  translationProvider: string
  handleOcrProviderChange: (value: string) => void
  handleTranslationProviderChange: (value: string) => void

  // Provider secrets
  ocrSecrets: Record<string, unknown>
  translationSecrets: Record<string, unknown>
  handleOcrSecretChange: (key: string, value: string) => void
  handleTranslationSecretChange: (key: string, value: string) => void

  // Available providers
  availableOcrProviders: string[]
  availableTranslationProviders: string[]

  // Configuration fields
  ocrConfigFields: Array<{ key: string; label: string; type: string; required: boolean }>
  translationConfigFields: Array<{ key: string; label: string; type: string; required: boolean }>

  // Apply settings
  handleApplySettings: () => void
}

export function useSettings(): UseSettingsReturn {
  const { i18n } = useTranslation()
  const settingsService = getSettingsService()
  const ocrService = getOcrService()
  const translationService = getTranslationService()

  // State for all settings
  const [language, setLanguage] = useState(i18n.language)
  const [autoTranslate, setAutoTranslate] = useState(settingsService.getAutoTranslate())
  const [appearance, setAppearance] = useState(settingsService.getAppearanceSettings())

  // AI providers
  const [ocrProvider, setOcrProvider] = useState(settingsService.getOcrProvider())
  const [translationProvider, setTranslationProvider] = useState(
    settingsService.getTranslationProvider()
  )

  // Provider secrets
  const [ocrSecrets, setOcrSecrets] = useState<Record<string, unknown>>({})
  const [translationSecrets, setTranslationSecrets] = useState<Record<string, unknown>>({})

  // Available providers
  const availableOcrProviders = ocrService.getAvailableProviders()
  const availableTranslationProviders = translationService.getAvailableProviders()

  // Configuration fields
  const ocrConfigFields = ocrService.getProviderConfigFields(ocrProvider)
  const translationConfigFields = translationService.getProviderConfigFields(translationProvider)

  // Load settings on component mount
  useEffect(() => {
    const settings = settingsService.getSettings()
    setLanguage(settings.language)
    setAutoTranslate(settings.autoTranslate)
    setAppearance(settings.appearance)
    setOcrProvider(settings.ai.ocrProvider)
    setTranslationProvider(settings.ai.translationProvider)

    // Load secrets
    const currentOcrSecrets = SecretsManager.getOcrSecret(settings.ai.ocrProvider)
    const currentTranslationSecrets = SecretsManager.getTranslationSecret(
      settings.ai.translationProvider
    )

    setOcrSecrets(currentOcrSecrets)
    setTranslationSecrets(currentTranslationSecrets)
  }, [settingsService])

  const handleLanguageChange = useCallback(
    (value: string): void => {
      setLanguage(value)
      i18n.changeLanguage(value)
      settingsService.setLanguage(value)
    },
    [i18n, settingsService]
  )

  const handleAppearanceChange = useCallback(
    (key: string, value: boolean): void => {
      const updatedAppearance = { ...appearance, [key]: value }
      setAppearance(updatedAppearance)
      settingsService.updateAppearanceSettings({ [key]: value })
    },
    [appearance, settingsService]
  )

  const handleAutoTranslateChange = useCallback(
    (value: boolean): void => {
      setAutoTranslate(value)
      settingsService.setAutoTranslate(value)
    },
    [settingsService]
  )

  const handleOcrProviderChange = useCallback((value: string): void => {
    setOcrProvider(value)
    const providerSecrets = SecretsManager.getOcrSecret(value)
    setOcrSecrets(providerSecrets)
  }, [])

  const handleTranslationProviderChange = useCallback((value: string): void => {
    setTranslationProvider(value)
    const providerSecrets = SecretsManager.getTranslationSecret(value)
    setTranslationSecrets(providerSecrets)
  }, [])

  const handleOcrSecretChange = useCallback((key: string, value: string): void => {
    if (key.includes('.')) {
      // Handle nested keys like 'additionalParams.model'
      const [parent, child] = key.split('.')
      setOcrSecrets((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setOcrSecrets((prev) => ({
        ...prev,
        [key]: value
      }))
    }
  }, [])

  const handleTranslationSecretChange = useCallback((key: string, value: string): void => {
    if (key.includes('.')) {
      // Handle nested keys like 'additionalParams.model'
      const [parent, child] = key.split('.')
      setTranslationSecrets((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setTranslationSecrets((prev) => ({
        ...prev,
        [key]: value
      }))
    }
  }, [])

  const handleApplySettings = useCallback((): void => {
    // Save AI provider selections
    settingsService.updateAISettings({
      ocrProvider,
      translationProvider
    })

    // Save OCR secrets
    SecretsManager.setOcrSecret(ocrProvider, ocrSecrets)

    // Save translation secrets
    SecretsManager.setTranslationSecret(translationProvider, translationSecrets)

    // Save other settings
    settingsService.setLanguage(language)
    settingsService.setAutoTranslate(autoTranslate)
    settingsService.updateAppearanceSettings(appearance)
  }, [
    settingsService,
    ocrProvider,
    translationProvider,
    ocrSecrets,
    translationSecrets,
    language,
    autoTranslate,
    appearance
  ])

  return {
    // Language settings
    language,
    handleLanguageChange,

    // Auto translate setting
    autoTranslate,
    handleAutoTranslateChange,

    // Appearance settings
    appearance,
    handleAppearanceChange,

    // AI provider settings
    ocrProvider,
    translationProvider,
    handleOcrProviderChange,
    handleTranslationProviderChange,

    // Provider secrets
    ocrSecrets,
    translationSecrets,
    handleOcrSecretChange,
    handleTranslationSecretChange,

    // Available providers
    availableOcrProviders,
    availableTranslationProviders,

    // Configuration fields
    ocrConfigFields,
    translationConfigFields,

    // Apply settings
    handleApplySettings
  }
}
