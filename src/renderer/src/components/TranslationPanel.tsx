import React, { useState, useEffect } from 'react'
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
import { Copy, Check, RefreshCw, Languages, Share2, AlertCircle } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { getOcrService, getTranslationService, getSettingsService } from '../service'

// Move the helper functions outside of the component
const cleanHtmlContent = (content: string): string => {
  // Remove markdown code block markers if present
  return content
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
}

const isHtmlContent = (text: string): boolean => {
  // Strip markdown code block markers if present
  const cleanText = cleanHtmlContent(text)
  return /<\/?[a-z][\s\S]*>/i.test(cleanText)
}

// Add a new component for safely rendering HTML content
const HtmlContent = ({ content }: { content: string }): React.ReactElement => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: cleanHtmlContent(content) }}
      style={{
        fontSize: '14px',
        lineHeight: '1.5',
        color: 'var(--gray-12)'
      }}
      className="html-content"
    />
  )
}

interface TranslationPanelProps {
  extractedText: string | null
  extractedImage: string | null // Base64 image string
  hasActiveDocument: boolean
  setExtractedText?: (text: string) => void
}

export function TranslationPanel({
  extractedText,
  extractedImage,
  hasActiveDocument,
  setExtractedText
}: TranslationPanelProps): React.ReactElement {
  const { t } = useTranslation()
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [copied, setCopied] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [translationError, setTranslationError] = useState<string | null>(null)
  const [ocrInProgress, setOcrInProgress] = useState(false)

  // Get services
  const translationService = getTranslationService()
  const ocrService = getOcrService()
  const settingsService = getSettingsService()

  const hasContent = extractedText || extractedImage
  const autoTranslate = settingsService.getAutoTranslate()

  // Process OCR on images
  const processImageWithOcr = async (imageData: string): Promise<void> => {
    setOcrInProgress(true)
    setOcrError(null)

    try {
      const result = await ocrService.processImage(imageData, {
        detectLanguage: true,
        returnBoundingBoxes: false
      })

      if (result.text && setExtractedText) {
        setExtractedText(result.text)
      } else {
        setOcrError(t('translationPanel.ocrError.noTextFound'))
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      setOcrError(t('translationPanel.ocrError.processingFailed'))
    } finally {
      setOcrInProgress(false)
    }
  }

  const handleTranslate = async (): Promise<void> => {
    if (!extractedText) return

    setIsTranslating(true)
    setTranslationError(null)

    try {
      const result = await translationService.translateText(extractedText, {
        targetLanguage,
        format: 'text'
      })

      setTranslatedContent(result.translatedText)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslationError(t('translationPanel.translationError'))
      setTranslatedContent(null)
    } finally {
      setIsTranslating(false)
    }
  }

  // Process content when it changes
  useEffect(() => {
    const processContent = async (): Promise<void> => {
      if (!hasContent) return

      // Only auto-translate if we have text and auto-translate is enabled
      if (extractedText && autoTranslate) {
        await handleTranslate()
      }
    }

    processContent()
  }, [extractedText, autoTranslate, hasContent])

  const handleCopy = (): void => {
    if (translatedContent) {
      navigator.clipboard.writeText(translatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
              {/* Show errors if any */}
              {ocrError && (
                <Box mb="4">
                  <Flex gap="2" align="center" style={{ color: 'var(--red-9)' }}>
                    <AlertCircle size={16} />
                    <Text size="2" color="red">
                      {ocrError}
                    </Text>
                  </Flex>
                </Box>
              )}

              {translationError && (
                <Box mb="4">
                  <Flex gap="2" align="center" style={{ color: 'var(--red-9)' }}>
                    <AlertCircle size={16} />
                    <Text size="2" color="red">
                      {translationError}
                    </Text>
                  </Flex>
                </Box>
              )}

              {extractedText && (
                <Box mb="4">
                  <Heading as="h3" size="2" mb="2" color="blue">
                    {t('translationPanel.extractedTextTitle')}
                  </Heading>
                  <Card
                    variant="surface"
                    style={{ backgroundColor: 'var(--blue-a2)', border: '1px solid var(--blue-6)' }}
                  >
                    <Box p="3">
                      {isHtmlContent(extractedText) ? (
                        <HtmlContent content={extractedText} />
                      ) : (
                        <Text
                          as="div"
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            color: 'var(--gray-12)'
                          }}
                        >
                          {extractedText}
                        </Text>
                      )}
                    </Box>
                  </Card>
                </Box>
              )}

              {extractedImage && (
                <Box mb="4">
                  <Flex justify="between" align="center" mb="2">
                    <Heading as="h3" size="2" color="green">
                      {t('translationPanel.extractedImageTitle')}
                    </Heading>
                    {!extractedText && (
                      <Button
                        size="1"
                        variant="soft"
                        color="green"
                        onClick={() => processImageWithOcr(extractedImage)}
                        disabled={ocrInProgress}
                      >
                        {ocrInProgress ? <RefreshCw size={14} className="animate-spin" /> : null}
                        {t('translationPanel.extractTextFromImage')}
                      </Button>
                    )}
                  </Flex>
                  <Card
                    variant="surface"
                    style={{ backgroundColor: 'var(--jade-a2)', border: '1px solid var(--jade-6)' }}
                  >
                    <Box p="3">
                      <img
                        src={extractedImage}
                        alt={t('translationPanel.extractedImageAlt')}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          display: 'block',
                          margin: 'auto',
                          borderRadius: 'var(--radius-2)'
                        }}
                      />
                    </Box>
                  </Card>
                  {ocrInProgress && (
                    <Flex align="center" gap="2" mt="2">
                      <RefreshCw size={14} className="animate-spin" />
                      <Text size="1" color="gray">
                        {t('translationPanel.processingOcr')}
                      </Text>
                    </Flex>
                  )}
                </Box>
              )}

              {/* Translated content section */}
              {hasContent && (
                <Box mt="4">
                  <Flex justify="between" align="center" mb="2">
                    <Heading as="h3" size="2" color="purple">
                      {t('translationPanel.translatedTextTitle')}
                    </Heading>
                    {translatedContent && (
                      <Flex gap="2">
                        <Tooltip
                          content={
                            copied ? t('translationPanel.copied') : t('translationPanel.copy')
                          }
                        >
                          <IconButton size="1" variant="ghost" onClick={handleCopy}>
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip content={t('translationPanel.share')}>
                          <IconButton size="1" variant="ghost">
                            <Share2 size={14} />
                          </IconButton>
                        </Tooltip>
                      </Flex>
                    )}
                  </Flex>

                  <Card
                    variant="surface"
                    style={{
                      backgroundColor: translatedContent ? 'var(--purple-a2)' : 'var(--gray-a2)',
                      border: `1px solid var(--${translatedContent ? 'purple' : 'gray'}-6)`
                    }}
                  >
                    {isTranslating ? (
                      <Flex align="center" justify="center" p="4">
                        <RefreshCw size={20} className="animate-spin" />
                        <Text ml="2">{t('translationPanel.translating')}</Text>
                      </Flex>
                    ) : translatedContent ? (
                      <Box p="3">
                        {isHtmlContent(translatedContent) ? (
                          <HtmlContent content={translatedContent} />
                        ) : (
                          <Text
                            as="div"
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              color: 'var(--gray-12)'
                            }}
                          >
                            {translatedContent}
                          </Text>
                        )}
                      </Box>
                    ) : (
                      <Flex align="center" justify="center" p="4">
                        <Text color="gray" style={{ fontStyle: 'italic' }}>
                          {t('translationPanel.notTranslatedYet')}
                        </Text>
                      </Flex>
                    )}
                  </Card>
                </Box>
              )}
            </ScrollArea>

            {/* Translation actions */}
            {hasContent && (
              <Box p="3" style={{ borderTop: '1px solid var(--gray-6)' }}>
                <Flex justify="end" gap="2">
                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating || !extractedText}
                    color="blue"
                  >
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

// Add a global style for HTML content, especially tables
const style = document.createElement('style')
style.innerHTML = `
  .html-content table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
  }
  .html-content th, .html-content td {
    border: 1px solid var(--gray-6);
    padding: 8px;
    text-align: left;
  }
  .html-content th {
    background-color: var(--gray-3);
  }
  .html-content tr:nth-child(even) {
    background-color: var(--gray-2);
  }
`
document.head.appendChild(style)
