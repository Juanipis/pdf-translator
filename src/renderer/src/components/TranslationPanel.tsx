import React, { useState } from 'react'
import {
  Card,
  Flex,
  Heading,
  Text,
  ScrollArea,
  Box,
  Select,
  Button,
  IconButton,
  Tooltip
} from '@radix-ui/themes'
import { useTranslation } from 'react-i18next'
import { Copy, Check, RefreshCw, Languages, Share2 } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface TranslationPanelProps {
  extractedText: string | null
  extractedImage: string | null // Base64 image string
  hasActiveDocument: boolean
}

export function TranslationPanel({
  extractedText,
  extractedImage,
  hasActiveDocument
}: TranslationPanelProps): React.ReactElement {
  const { t } = useTranslation()
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [copied, setCopied] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)

  const hasContent = extractedText || extractedImage

  const handleCopy = () => {
    if (translatedContent) {
      navigator.clipboard.writeText(translatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTranslate = () => {
    // Simulate translation process
    setIsTranslating(true)
    setTimeout(() => {
      if (extractedText) {
        // Mock translation result
        setTranslatedContent(
          `Translated text to ${targetLanguage}: ${extractedText.substring(0, 100)}...`
        )
      } else {
        setTranslatedContent(t('translationPanel.imageTranslationResult'))
      }
      setIsTranslating(false)
    }, 1500)
  }

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ]

  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <Flex direction="column" style={{ height: '100%' }}>
        <Box
          p="3"
          style={{
            borderBottom: '1px solid var(--gray-6)'
          }}
        >
          <Flex justify="between" align="center">
            <Heading as="h2" size="3">
              {t('translationPanel.title')}
            </Heading>
            {hasContent && (
              <Flex gap="2" align="center">
                <Select.Root value={targetLanguage} onValueChange={setTargetLanguage}>
                  <Select.Trigger aria-label={t('translationPanel.selectLanguage')} />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>{t('translationPanel.languages')}</Select.Label>
                      {languages.map((lang) => (
                        <Select.Item key={lang.value} value={lang.value}>
                          {lang.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Flex>
            )}
          </Flex>
        </Box>

        {!hasActiveDocument ? (
          <EmptyState
            icon={<Languages size={48} />}
            title={t('translationPanel.emptyState.noDocument.title')}
            description={t('translationPanel.emptyState.noDocument.description')}
          />
        ) : !hasContent ? (
          <EmptyState
            icon={<Languages size={48} />}
            title={t('translationPanel.emptyState.noSelection.title')}
            description={t('translationPanel.emptyState.noSelection.description')}
          />
        ) : (
          <>
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
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        display: 'block',
                        margin: 'auto'
                      }}
                    />
                  </Card>
                  <Text size="1" color="gray" mt="1">
                    {t('translationPanel.extractedImageCaption')}
                  </Text>
                </Box>
              )}

              {/* Translated content section */}
              {hasContent && (
                <Box mt="4">
                  <Flex justify="between" align="center" mb="2">
                    <Heading as="h3" size="2">
                      {t('translationPanel.translatedContentTitle')}
                    </Heading>
                    <Flex gap="2">
                      {translatedContent && (
                        <>
                          <Tooltip content={t('translationPanel.shareTranslation')}>
                            <IconButton variant="soft" size="1">
                              <Share2 size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            content={
                              copied
                                ? t('translationPanel.copied')
                                : t('translationPanel.copyToClipboard')
                            }
                          >
                            <IconButton variant="soft" size="1" onClick={handleCopy}>
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Flex>
                  </Flex>

                  <Card variant="surface">
                    {translatedContent ? (
                      <Text as="div" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {translatedContent}
                      </Text>
                    ) : (
                      <Text as="p" color="gray">
                        {t('translationPanel.translationPlaceholder')}
                      </Text>
                    )}
                  </Card>
                </Box>
              )}
            </ScrollArea>

            {/* Translation actions */}
            {hasContent && (
              <Box p="3" style={{ borderTop: '1px solid var(--gray-6)' }}>
                <Flex justify="end" gap="2">
                  <Button onClick={handleTranslate} disabled={isTranslating} color="blue">
                    {isTranslating ? <RefreshCw size={16} className="animate-spin" /> : null}
                    {isTranslating
                      ? t('translationPanel.translating')
                      : translatedContent
                        ? t('translationPanel.retranslate')
                        : t('translationPanel.translate')}
                  </Button>
                </Flex>
              </Box>
            )}
          </>
        )}
      </Flex>
    </Card>
  )
}
