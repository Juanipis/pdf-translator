import React from 'react'
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
import { useSettings } from '../hooks'

export function SettingsDialog(): React.ReactElement {
  const { t } = useTranslation()
  const { mode } = useTheme()

  const {
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
  } = useSettings()

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
