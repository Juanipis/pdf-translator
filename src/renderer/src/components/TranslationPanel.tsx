import React from 'react'
import { Card, Flex, Heading, Text, ScrollArea, Box } from '@radix-ui/themes'
import { useTranslation } from 'react-i18next'

interface TranslationPanelProps {
  extractedText: string | null
  extractedImage: string | null // Base64 image string
}

export function TranslationPanel({
  extractedText,
  extractedImage
}: TranslationPanelProps): React.ReactElement {
  const { t } = useTranslation()

  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <Flex direction="column" style={{ height: '100%' }}>
        <Box
          p="3"
          style={{
            borderBottom: '1px solid var(--gray-5)'
          }}
        >
          <Heading as="h2" size="3">
            {t('translationPanel.title')}
          </Heading>
        </Box>
        <ScrollArea style={{ flexGrow: 1, padding: 'var(--space-3)' }}>
          {extractedText && (
            <Box mb="4">
              <Heading as="h3" size="2" mb="2">
                {t('translationPanel.extractedTextTitle')}
              </Heading>
              <Card variant="surface">
                <Text as="div" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {extractedText}
                </Text>
              </Card>
            </Box>
          )}
          {extractedImage && (
            <Box mb="4">
              <Heading as="h3" size="2" mb="2">
                {t('translationPanel.extractedImageTitle')}
              </Heading>
              <Card variant="surface">
                <img
                  src={extractedImage}
                  alt={t('translationPanel.extractedImageAlt')}
                  style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: 'auto' }}
                />
              </Card>
              <Text size="1" color="gray" mt="1">
                {t('translationPanel.extractedImageCaption')}
              </Text>
            </Box>
          )}
          {!extractedText && !extractedImage && (
            <Text color="gray">{t('translationPanel.noContentExtracted')}</Text>
          )}

          {/* Placeholder for translated content */}
          {(extractedText || extractedImage) && (
            <Box mt="4">
              <Heading as="h3" size="2" mb="2">
                {t('translationPanel.translatedContentTitle')}
              </Heading>
              <Card variant="surface">
                {/* <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {translatedText || t('translationPanel.translationPlaceholder')}
                </ReactMarkdown> */}
                <Text as="p" color="gray">
                  {t('translationPanel.translationFeaturePlaceholder')}
                </Text>
              </Card>
            </Box>
          )}
        </ScrollArea>
        {/* TODO: Add translation controls, copy button etc. */}
      </Flex>
    </Card>
  )
}
