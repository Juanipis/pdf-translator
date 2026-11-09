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
  Palette,
  Image,
  Globe
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../hooks'

// Helper component for consistent input styling
const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: 'var(--space-2) var(--space-3)', // Use theme spacing
      borderRadius: 'var(--radius-2)',
      border: '1px solid var(--gray-a7)', // Slightly more prominent border
      fontSize: 'var(--font-size-2)', // Use theme font size
      backgroundColor: 'var(--gray-a2)', // Subtle background
      color: 'var(--gray-12)',
      // eslint-disable-next-line react/prop-types
      ...props.style
    }}
  />
)

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
      <Dialog.Content style={{ maxWidth: 550, borderRadius: 'var(--radius-4)' }}>
        {/* Increased max width and radius */}
        <Flex justify="between" align="center" mb="4">
          <Heading size="5" as="h2" weight="medium">
            {/* Adjusted size and weight */}
            {t('settings.title')}
          </Heading>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" aria-label={t('settings.closeButton')}>
              <CloseIcon size={16} />
            </IconButton>
          </Dialog.Close>
        </Flex>
        <Tabs.Root defaultValue="general">
          <Tabs.List>
            <Tabs.Trigger value="general">
              <Languages size={16} style={{ marginRight: 'var(--space-2)' }} />
              {t('settings.tabs.general')}
            </Tabs.Trigger>
            <Tabs.Trigger value="appearance">
              <Palette size={16} style={{ marginRight: 'var(--space-2)' }} />
              {t('settings.tabs.appearance')}
            </Tabs.Trigger>
            <Tabs.Trigger value="ai">
              <Globe size={16} style={{ marginRight: 'var(--space-2)' }} />
              {t('settings.tabs.ai')}
            </Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            {' '}
            {/* Increased padding top */}
            <Tabs.Content value="general">
              <Card variant="surface" mt="2" style={{ background: 'var(--gray-a2)' }}>
                {' '}
                {/* Subtle background */}
                <Flex direction="column" gap="4">
                  {' '}
                  {/* Increased gap */}
                  <Flex justify="between" align="center">
                    <Flex gap="2" align="center">
                      <Languages size={18} color="var(--accent-9)" /> {/* Accent color for icon */}
                      <Text as="label" size="2" weight="medium" htmlFor="language-select">
                        {' '}
                        {/* Medium weight */}
                        {t('settings.language')}
                      </Text>
                    </Flex>
                    <Select.Root value={language} onValueChange={handleLanguageChange}>
                      <Select.Trigger id="language-select" variant="soft" /> {/* Soft variant */}
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
                      <Palette size={18} color="var(--accent-9)" /> {/* Accent color for icon */}
                      <Text as="div" size="2" weight="medium">
                        {' '}
                        {/* Medium weight */}
                        {t('settings.colorTheme')}
                      </Text>
                    </Flex>
                    <Text size="2" color="gray">
                      {mode === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
                      <Text size="1"> ({t('settings.toggleInHeader')})</Text>
                    </Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text as="div" size="2" weight="medium">
                      {' '}
                      {/* Medium weight */}
                      {t('settings.autoTranslate')}
                    </Text>
                    <Switch
                      checked={autoTranslate}
                      onCheckedChange={handleAutoTranslateChange}
                      color="blue" // Explicit color
                    />
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>
            <Tabs.Content value="appearance">
              <Card variant="surface" mt="2" style={{ background: 'var(--gray-a2)' }}>
                {' '}
                {/* Subtle background */}
                <Flex direction="column" gap="4">
                  {' '}
                  {/* Increased gap */}
                  <Text as="p" size="2" color="gray" mb="2">
                    {t('settings.appearance.description')}
                  </Text>
                  <Flex justify="between" align="center">
                    <Text as="div" size="2" weight="medium">
                      {' '}
                      {/* Medium weight */}
                      {t('settings.appearance.showPageNumbers')}
                    </Text>
                    <Switch
                      checked={appearance.showPageNumbers}
                      onCheckedChange={(value) => handleAppearanceChange('showPageNumbers', value)}
                      color="blue" // Explicit color
                    />
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text as="div" size="2" weight="medium">
                      {' '}
                      {/* Medium weight */}
                      {t('settings.appearance.highlightExtractedText')}
                    </Text>
                    <Switch
                      checked={appearance.highlightExtractedText}
                      onCheckedChange={(value) =>
                        handleAppearanceChange('highlightExtractedText', value)
                      }
                      color="blue" // Explicit color
                    />
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text as="div" size="2" weight="medium">
                      {' '}
                      {/* Medium weight */}
                      {t('settings.appearance.showToolbar')}
                    </Text>
                    <Switch
                      checked={appearance.showToolbar}
                      onCheckedChange={(value) => handleAppearanceChange('showToolbar', value)}
                      color="blue" // Explicit color
                    />
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>
            <Tabs.Content value="ai">
              <Card variant="surface" mt="2" style={{ background: 'var(--gray-a2)' }}>
                {' '}
                {/* Subtle background */}
                <Flex direction="column" gap="5">
                  {' '}
                  {/* Increased gap */}
                  {/* OCR Provider Section */}
                  <Box>
                    <Flex gap="2" align="center" mb="3">
                      {' '}
                      {/* Increased margin bottom */}
                      <Image size={20} color="var(--accent-9)" /> {/* Accent color & size */}
                      <Text as="div" size="3" weight="medium">
                        {' '}
                        {/* Adjusted size & weight */}
                        {t('settings.ai.ocrProvider')}
                      </Text>
                    </Flex>

                    <Flex justify="between" align="center" mb="3">
                      <Text as="label" size="2" htmlFor="ocr-provider-select">
                        {t('settings.ai.selectProvider')}
                      </Text>
                      <Select.Root value={ocrProvider} onValueChange={handleOcrProviderChange}>
                        <Select.Trigger id="ocr-provider-select" variant="soft" />{' '}
                        {/* Soft variant */}
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
                      <Box mt="3">
                        {' '}
                        {/* Added margin top */}
                        <Text as="p" size="2" mb="2" color="gray">
                          {' '}
                          {/* Gray color for description */}
                          {t('settings.ai.providerConfiguration')}
                        </Text>
                        <Flex direction="column" gap="3">
                          {' '}
                          {/* Increased gap */}
                          {ocrConfigFields.map((field) => {
                            let value = ''
                            if (field.key.includes('.')) {
                              const keys = field.key.split('.')
                              let obj: unknown = ocrSecrets
                              for (const k of keys) {
                                if (obj && typeof obj === 'object' && k in obj) {
                                  obj = (obj as Record<string, unknown>)[k]
                                } else {
                                  obj = undefined
                                  break
                                }
                              }
                              value = typeof obj === 'string' ? obj : ''
                            } else {
                              const v = ocrSecrets[field.key]
                              value = typeof v === 'string' ? v : ''
                            }
                            return (
                              <Flex key={field.key} justify="between" align="center">
                                <Text as="label" size="2" htmlFor={`ocr-${field.key}`}>
                                  {field.label}
                                  {field.required && <Text color="red"> *</Text>}
                                </Text>
                                <Box style={{ width: '60%' }}>
                                  <StyledInput
                                    id={`ocr-${field.key}`}
                                    type={field.type}
                                    value={value}
                                    onChange={(e) =>
                                      handleOcrSecretChange(field.key, e.target.value)
                                    }
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
                    <Flex gap="2" align="center" mb="3">
                      {' '}
                      {/* Increased margin bottom */}
                      <Globe size={20} color="var(--accent-9)" /> {/* Accent color & size */}
                      <Text as="div" size="3" weight="medium">
                        {' '}
                        {/* Adjusted size & weight */}
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
                        <Select.Trigger id="translation-provider-select" variant="soft" />{' '}
                        {/* Soft variant */}
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
                      <Box mt="3">
                        {' '}
                        {/* Added margin top */}
                        <Text as="p" size="2" mb="2" color="gray">
                          {' '}
                          {/* Gray color for description */}
                          {t('settings.ai.providerConfiguration')}
                        </Text>
                        <Flex direction="column" gap="3">
                          {' '}
                          {/* Increased gap */}
                          {translationConfigFields.map((field) => {
                            let value = ''
                            if (field.key.includes('.')) {
                              const keys = field.key.split('.')
                              let obj: unknown = translationSecrets
                              for (const k of keys) {
                                if (obj && typeof obj === 'object' && k in obj) {
                                  obj = (obj as Record<string, unknown>)[k]
                                } else {
                                  obj = undefined
                                  break
                                }
                              }
                              value = typeof obj === 'string' ? obj : ''
                            } else {
                              const v = translationSecrets[field.key]
                              value = typeof v === 'string' ? v : ''
                            }
                            return (
                              <Flex key={field.key} justify="between" align="center">
                                <Text as="label" size="2" htmlFor={`translation-${field.key}`}>
                                  {field.label}
                                  {field.required && <Text color="red"> *</Text>}
                                </Text>
                                <Box style={{ width: '60%' }}>
                                  <StyledInput
                                    id={`translation-${field.key}`}
                                    type={field.type}
                                    value={value}
                                    onChange={(e) =>
                                      handleTranslationSecretChange(field.key, e.target.value)
                                    }
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
          </Box>
        </Tabs.Root>
        <Flex gap="3" mt="5" justify="end">
          {' '}
          {/* Increased margin top */}
          <Dialog.Close>
            <Button variant="soft" color="gray" size="2">
              {' '}
              {/* Consistent button size */}
              {t('settings.cancelButton')}
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleApplySettings} size="2" color="blue">
              {' '}
              {/* Consistent button size & color */}
              {t('settings.applyButton')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
