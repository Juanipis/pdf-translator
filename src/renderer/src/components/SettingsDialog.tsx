import React, { useState } from 'react'
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
  Key,
  Palette
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

export function SettingsDialog(): React.ReactElement {
  const { t, i18n } = useTranslation()
  const { mode } = useTheme()
  const [language, setLanguage] = useState(i18n.language)
  const [apiKey, setApiKey] = useState('')
  const [autoTranslate, setAutoTranslate] = useState(false)

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    i18n.changeLanguage(value)
    localStorage.setItem('language', value)
  }

  const handleApplySettings = () => {
    // Save settings
    localStorage.setItem('apiKey', apiKey)
    localStorage.setItem('autoTranslate', String(autoTranslate))
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost" color="gray" aria-label={t('settings.openButton')}>
          <SettingsIcon size={20} />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 500 }}>
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

        <Tabs.Root defaultValue="general">
          <Tabs.List>
            <Tabs.Trigger value="general">{t('settings.tabs.general')}</Tabs.Trigger>
            <Tabs.Trigger value="appearance">{t('settings.tabs.appearance')}</Tabs.Trigger>
            <Tabs.Trigger value="translation">{t('settings.tabs.translation')}</Tabs.Trigger>
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
                    <Switch defaultChecked />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.appearance.highlightExtractedText')}
                    </Text>
                    <Switch defaultChecked />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.appearance.showToolbar')}
                    </Text>
                    <Switch defaultChecked />
                  </Flex>
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="translation">
              <Card variant="surface" mt="2">
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center">
                    <Flex gap="2" align="center">
                      <Key size={18} />
                      <Text as="label" size="2" weight="bold" htmlFor="api-key">
                        {t('settings.translation.apiKey')}
                      </Text>
                    </Flex>
                    <Box style={{ width: '60%' }}>
                      <input
                        type="password"
                        id="api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-2)',
                          border: '1px solid var(--gray-6)',
                          fontSize: 'var(--font-size-1)'
                        }}
                        placeholder={t('settings.translation.enterApiKey')}
                      />
                    </Box>
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.translation.autoTranslate')}
                    </Text>
                    <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
                  </Flex>

                  <Flex justify="between" align="center">
                    <Text as="div" size="2">
                      {t('settings.translation.translateImages')}
                    </Text>
                    <Switch defaultChecked />
                  </Flex>

                  <Text as="p" size="1" color="gray">
                    {t('settings.translation.apiKeyDescription')}
                  </Text>
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
