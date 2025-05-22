import React from 'react'
import { Dialog, Button, IconButton, Flex, Text, Heading } from '@radix-ui/themes'
import { Settings as SettingsIcon, X as CloseIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function SettingsDialog(): React.ReactElement {
  const { t } = useTranslation()

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost" color="gray">
          <SettingsIcon size={20} />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 450 }}>
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
        <Text as="p" size="2" color="gray" mb="5">
          {t('settings.description')}
        </Text>
        {/* Mock settings fields can go here */}
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {t('settings.closeButton')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
