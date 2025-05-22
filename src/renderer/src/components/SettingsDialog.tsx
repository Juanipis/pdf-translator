import React, { useState, useEffect } from 'react'
import {
  Dialog,
  Button,
  IconButton,
  Flex,
  Text,
  Heading,
  Tabs,
  Select,
  Switch,
  Box,
  Card
} from '@radix-ui/themes'
import {
  Settings as SettingsIcon,
  X as CloseIcon,
  Languages,
  User,
  Palette,
  Image,
  Globe
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import {
  getSettingsService,
  SecretsManager,
  getOcrService,
  getTranslationService
} from '../service'

export function SettingsDialog(): React.ReactElement {
  const { t, i18n } = useTranslation()
  const { mode } = useTheme()
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

  const handleLanguageChange = (value: string): void => {
    setLanguage(value)
    i18n.changeLanguage(value)
    settingsService.setLanguage(value)
  }

  const handleAppearanceChange = (key: keyof typeof appearance, value: boolean): void => {
    const updatedAppearance = { ...appearance, [key]: value }
    setAppearance(updatedAppearance)
    settingsService.updateAppearanceSettings({ [key]: value })
  }

  const handleAutoTranslateChange = (value: boolean): void => {
    setAutoTranslate(value)
    settingsService.setAutoTranslate(value)
  }

  const handleOcrProviderChange = (value: string): void => {
    setOcrProvider(value)
    const providerSecrets = SecretsManager.getOcrSecret(value)
    setOcrSecrets(providerSecrets)
  }

  const handleTranslationProviderChange = (value: string): void => {
    setTranslationProvider(value)
    const providerSecrets = SecretsManager.getTranslationSecret(value)
    setTranslationSecrets(providerSecrets)
  }

  const handleOcrSecretChange = (key: string, value: string): void => {
    if (key.includes('.')) {
      // Handle nested keys like 'additionalParams.model'
      const [parent, child] = key.split('.')
      setOcrSecrets({
        ...ocrSecrets,
        [parent]: {
          ...ocrSecrets[parent],
          [child]: value
        }
      })
    } else {
      setOcrSecrets({
        ...ocrSecrets,
        [key]: value
      })
    }
  }

  const handleTranslationSecretChange = (key: string, value: string): void => {
    if (key.includes('.')) {
      // Handle nested keys like 'additionalParams.model'
      const [parent, child] = key.split('.')
      setTranslationSecrets({
        ...translationSecrets,
        [parent]: {
          ...translationSecrets[parent],
          [child]: value
        }
      })
    } else {
      setTranslationSecrets({
        ...translationSecrets,
        [key]: value
      })
    }
  }

  const handleApplySettings = (): void => {
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
  }

  // Get configuration fields for the selected providers
  const ocrConfigFields = ocrService.getProviderConfigFields(ocrProvider)
  const translationConfigFields = translationService.getProviderConfigFields(translationProvider)

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost" color="gray" aria-label={t('settings.openButton')}>
          <SettingsIcon size={20} />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 500 }}>
        <Dialog.Title asChild>
          <Flex justify="between" align="center" mb="4">
            <Heading size="4" as="h2">
              {t('settings.title')}
            </Heading>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" aria-label={t('settings.closeButton')}>
                <CloseIcon size={16} />
              </IconButton>
            </Dialog.Close>
          </Flex>
        </Dialog.Title>

        <Tabs.Root defaultValue="general">
          <Tabs.List>
            <Tabs.Trigger value="general">{t('settings.tabs.general')}</Tabs.Trigger>
            <Tabs.Trigger value="appearance">{t('settings.tabs.appearance')}</Tabs.Trigger>
            <Tabs.Trigger value="ai">{t('settings.tabs.ai')}</Tabs.Trigger>
            <Tabs.Trigger value="account">{t('settings.tabs.account')}</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="general">
              <Card variant="surface" mt="2">
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center">
                    <Flex gap="2" align="center">
                      <Languages size={18} />
                      <Text as="label" size="2" weight="bold" htmlFor="language-select">
                        {t('settings.language')}
                      </Text>
                    </Flex>
                    <Select.Root value={language} onValueChange={handleLanguageChange}>
                      <Select.Trigger id="language-select" />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>{t('settings.selectLanguage')}</Select.Label>
                          <Select.Item value="en">English</Select.Item>
                          <Select.Item value="es">Español</Select.Item>
                          <Select.Item value="fr">Français</Select.Item>
                          <Select.Item value="de">Deutsch</Select.Item>
                          <Select.Item value="zh">中文</Select.Item>
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex justify="between" align="center">
                    <Flex gap="2" align="center">
                      <Palette size={18} />
                      <Text as="div" size="2" weight="bold">
                        {t('settings.colorTheme')}
                      </Text>
                    </Flex>
                    <Text size="2" color="gray">
                      {mode === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
                      <Text size="1"> ({t('settings.toggleInHeader')})</Text>
                    </Text>
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.autoTranslate')}
                    </Text>
                    <Switch checked={autoTranslate} onCheckedChange={handleAutoTranslateChange} />
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="appearance">
              <Card variant="surface" mt="2">
                <Flex direction="column" gap="3">
                  <Text as="p" size="2" color="gray" mb="2">
                    {t('settings.appearance.description')}
                  </Text>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.appearance.showPageNumbers')}
                    </Text>
                    <Switch
                      checked={appearance.showPageNumbers}
                      onCheckedChange={(value) => handleAppearanceChange('showPageNumbers', value)}
                    />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.appearance.highlightExtractedText')}
                    </Text>
                    <Switch
                      checked={appearance.highlightExtractedText}
                      onCheckedChange={(value) =>
                        handleAppearanceChange('highlightExtractedText', value)
                      }
                    />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.appearance.showToolbar')}
                    </Text>
                    <Switch
                      checked={appearance.showToolbar}
                      onCheckedChange={(value) => handleAppearanceChange('showToolbar', value)}
                    />
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="ai">
              <Card variant="surface" mt="2">
                <Flex direction="column" gap="4">
                  {/* OCR Provider Section */}
                  <Box>
                    <Flex gap="2" align="center" mb="2">
                      <Image size={18} />
                      <Text as="div" size="2" weight="bold">
                        {t('settings.ai.ocrProvider')}
                      </Text>
                    </Flex>

                    <Flex justify="between" align="center" mb="3">
                      <Text as="label" size="2" htmlFor="ocr-provider-select">
                        {t('settings.ai.selectProvider')}
                      </Text>
                      <Select.Root value={ocrProvider} onValueChange={handleOcrProviderChange}>
                        <Select.Trigger id="ocr-provider-select" />
                        <Select.Content>
                          <Select.Group>
                            <Select.Label>{t('settings.ai.availableProviders')}</Select.Label>
                            {availableOcrProviders.map((provider) => (
                              <Select.Item key={provider} value={provider}>
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                              </Select.Item>
                            ))}
                          </Select.Group>
                        </Select.Content>
                      </Select.Root>
                    </Flex>

                    {ocrConfigFields.length > 0 && (
                      <Box>
                        <Text as="p" size="2" mb="2">
                          {t('settings.ai.providerConfiguration')}
                        </Text>

                        <Flex direction="column" gap="2">
                          {ocrConfigFields.map((field) => {
                            const value = field.key.includes('.')
                              ? field.key.split('.').reduce((obj, key) => obj?.[key], ocrSecrets)
                              : ocrSecrets[field.key] || ''

                            return (
                              <Flex key={field.key} justify="between" align="center">
                                <Text as="label" size="2" htmlFor={`ocr-${field.key}`}>
                                  {field.label}
                                </Text>
                                <Box style={{ width: '60%' }}>
                                  <input
                                    id={`ocr-${field.key}`}
                                    type={field.type}
                                    value={value || ''}
                                    onChange={(e) =>
                                      handleOcrSecretChange(field.key, e.target.value)
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      borderRadius: 'var(--radius-2)',
                                      border: '1px solid var(--gray-6)',
                                      fontSize: 'var(--font-size-1)'
                                    }}
                                    required={field.required}
                                    placeholder={`${field.label}...`}
                                  />
                                </Box>
                              </Flex>
                            )
                          })}
                        </Flex>
                      </Box>
                    )}
                  </Box>

                  <Box mt="3">
                    <Flex gap="2" align="center" mb="2">
                      <Globe size={18} />
                      <Text as="div" size="2" weight="bold">
                        {t('settings.ai.translationProvider')}
                      </Text>
                    </Flex>

                    <Flex justify="between" align="center" mb="3">
                      <Text as="label" size="2" htmlFor="translation-provider-select">
                        {t('settings.ai.selectProvider')}
                      </Text>
                      <Select.Root
                        value={translationProvider}
                        onValueChange={handleTranslationProviderChange}
                      >
                        <Select.Trigger id="translation-provider-select" />
                        <Select.Content>
                          <Select.Group>
                            <Select.Label>{t('settings.ai.availableProviders')}</Select.Label>
                            {availableTranslationProviders.map((provider) => (
                              <Select.Item key={provider} value={provider}>
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                              </Select.Item>
                            ))}
                          </Select.Group>
                        </Select.Content>
                      </Select.Root>
                    </Flex>

                    {translationConfigFields.length > 0 && (
                      <Box>
                        <Text as="p" size="2" mb="2">
                          {t('settings.ai.providerConfiguration')}
                        </Text>

                        <Flex direction="column" gap="2">
                          {translationConfigFields.map((field) => {
                            const value = field.key.includes('.')
                              ? field.key
                                  .split('.')
                                  .reduce((obj, key) => obj?.[key], translationSecrets)
                              : translationSecrets[field.key] || ''

                            return (
                              <Flex key={field.key} justify="between" align="center">
                                <Text as="label" size="2" htmlFor={`translation-${field.key}`}>
                                  {field.label}
                                </Text>
                                <Box style={{ width: '60%' }}>
                                  <input
                                    id={`translation-${field.key}`}
                                    type={field.type}
                                    value={value || ''}
                                    onChange={(e) =>
                                      handleTranslationSecretChange(field.key, e.target.value)
                                    }
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      borderRadius: 'var(--radius-2)',
                                      border: '1px solid var(--gray-6)',
                                      fontSize: 'var(--font-size-1)'
                                    }}
                                    required={field.required}
                                    placeholder={`${field.label}...`}
                                  />
                                </Box>
                              </Flex>
                            )
                          })}
                        </Flex>
                      </Box>
                    )}
                  </Box>
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="account">
              <Card variant="surface" mt="2">
                <Flex direction="column" gap="3">
                  <Flex gap="2" align="center" mb="2">
                    <User size={18} />
                    <Text as="div" size="2" weight="bold">
                      {t('settings.account.userProfile')}
                    </Text>
                  </Flex>

                  <Text as="p" size="2" color="gray">
                    {t('settings.account.loginDescription')}
                  </Text>

                  <Flex justify="center" mt="2">
                    <Button size="2" variant="soft">
                      {t('settings.account.signIn')}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {t('settings.cancelButton')}
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleApplySettings}>{t('settings.applyButton')}</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
