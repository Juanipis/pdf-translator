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
  // Remove everything before and including 'HTML' (with optional backticks/whitespace/newlines)
  // Remove all trailing lines that only contain backticks and/or whitespace/newlines
  return content
    .replace(/^[\s`]*html[\s`]*\n?/i, '') // Remove up to and including 'HTML' (case-insensitive)
    .replace(/([\r\n]*[\s`]*```[\s`]*[\r\n]*)+$/gi, '') // Remove all trailing lines with only backticks/whitespace/newlines
    .replace(/`` `` ``/g, '')
    .trimEnd() // Remove any extra whitespace at the end
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
        fontSize: 'var(--font-size-2)', // Use theme variable
        lineHeight: '1.6', // Increased for readability
        color: 'var(--gray-12)'
      }}
      className="html-content" // Keep class for global styles
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
    <Card style={{ width: '100%', height: '100%', boxShadow: 'var(--shadow-4)' }}>
      <Flex direction="column" style={{ height: '100%' }}>
        <Box
          px="4"
          py="3"
          style={{
            borderBottom: '1px solid var(--gray-a6)', // Use alpha color for subtle border
            height: '72px', // Misma altura que el header de Source Document
            minHeight: '72px',
            maxHeight: '72px',
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          <Flex
            justify="between"
            align="center"
            style={{
              height: '100%', // Asegurar que el flex ocupa toda la altura
              width: '100%'
            }}
          >
            <Heading
              as="h2"
              size="5"
              weight="medium"
              style={{
                flexGrow: 1,
                flexShrink: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: 'var(--space-3)'
              }}
            >
              {t('translationPanel.title')}
            </Heading>
            {hasActiveDocument &&
              hasContent && ( // Show only if there's content and an active doc
                <Flex gap="3" align="center" style={{ flexShrink: 0 }}>
                  {' '}
                  {/* Prevent select group from shrinking excessively */} {/* Increased gap */}
                  <Select.Root value={targetLanguage} onValueChange={setTargetLanguage}>
                    <Select.Trigger
                      variant="soft" // Softer trigger variant
                      aria-label={t('translationPanel.selectLanguage')}
                    />
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
            icon={<Languages size={52} strokeWidth={1.5} />} // Adjusted icon
            title={t('translationPanel.emptyState.noDocument.title')}
            description={t('translationPanel.emptyState.noDocument.description')}
          />
        ) : !hasContent ? (
          <EmptyState
            icon={<Languages size={52} strokeWidth={1.5} />} // Adjusted icon
            title={t('translationPanel.emptyState.noSelection.title')}
            description={t('translationPanel.emptyState.noSelection.description')}
          />
        ) : (
          <>
            <ScrollArea style={{ flexGrow: 1, padding: 'var(--space-4)' }}>
              {' '}
              {/* Increased padding */}
              {/* Show errors if any */}
              {ocrError && (
                <Box mb="4">
                  <Flex gap="2" align="center" style={{ color: 'var(--red-10)' }}>
                    {' '}
                    {/* Darker red */}
                    <AlertCircle size={18} /> {/* Slightly larger icon */}
                    <Text size="2" color="red" weight="medium">
                      {' '}
                      {/* Added weight */}
                      {ocrError}
                    </Text>
                  </Flex>
                </Box>
              )}
              {translationError && (
                <Box mb="4">
                  <Flex gap="2" align="center" style={{ color: 'var(--red-10)' }}>
                    {' '}
                    {/* Darker red */}
                    <AlertCircle size={18} /> {/* Slightly larger icon */}
                    <Text size="2" color="red" weight="medium">
                      {' '}
                      {/* Added weight */}
                      {translationError}
                    </Text>
                  </Flex>
                </Box>
              )}
              {extractedText && (
                <Box mb="4">
                  <Heading as="h3" size="3" mb="2" color="blue">
                    {' '}
                    {/* Adjusted size */}
                    {t('translationPanel.extractedTextTitle')}
                  </Heading>
                  <Card
                    variant="surface"
                    style={{
                      backgroundColor: 'var(--blue-a3)', // Lighter alpha
                      border: '1px solid var(--blue-a6)' // Alpha border
                    }}
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
                            fontSize: 'var(--font-size-2)', // Use theme variable
                            lineHeight: '1.6', // Increased for readability
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
                    <Heading as="h3" size="3" color="green">
                      {' '}
                      {/* Adjusted size */}
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
                        {ocrInProgress ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Languages size={14} /> // More relevant icon
                        )}
                        <Text ml="1">{t('translationPanel.extractTextFromImage')}</Text>{' '}
                        {/* Added margin */}
                      </Button>
                    )}
                  </Flex>
                  <Card
                    variant="surface"
                    style={{
                      backgroundColor: 'var(--jade-a3)', // Lighter alpha
                      border: '1px solid var(--jade-a6)' // Alpha border
                    }}
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
              {hasActiveDocument &&
                hasContent && ( // Show only if there's content and an active doc
                  <Box mt="4">
                    <Flex justify="between" align="center" mb="2">
                      <Heading as="h3" size="3" color="purple">
                        {' '}
                        {/* Adjusted size */}
                        {t('translationPanel.translatedTextTitle')}
                      </Heading>
                      {translatedContent && (
                        <Flex gap="2">
                          <Tooltip
                            content={
                              copied
                                ? t('translationPanel.copied')
                                : t('translationPanel.copyToClipboard') // More descriptive
                            }
                          >
                            <IconButton
                              size="1"
                              variant={copied ? 'solid' : 'ghost'} // Visual feedback for copy
                              color={copied ? 'green' : 'gray'} // Visual feedback for copy
                              onClick={handleCopy}
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip content={t('translationPanel.share')}>
                            <IconButton size="1" variant="ghost" disabled>
                              {' '}
                              {/* Disabled for now */}
                              <Share2 size={14} />
                            </IconButton>
                          </Tooltip>
                        </Flex>
                      )}
                    </Flex>

                    <Card
                      variant="surface"
                      style={{
                        backgroundColor: translatedContent
                          ? 'var(--purple-a3)' // Lighter alpha
                          : 'var(--gray-a3)', // Lighter alpha
                        border: `1px solid var(--${translatedContent ? 'purple' : 'gray'}-a6)` // Alpha border
                      }}
                    >
                      {isTranslating ? (
                        <Flex align="center" justify="center" p="4" gap="2">
                          {' '}
                          {/* Added gap */}
                          <RefreshCw size={20} className="animate-spin" />
                          <Text ml="2" weight="medium">
                            {' '}
                            {/* Added weight */}
                            {t('translationPanel.translating')}
                          </Text>
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
                                fontSize: 'var(--font-size-2)', // Use theme variable
                                lineHeight: '1.6', // Increased for readability
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
            {hasActiveDocument &&
              hasContent && ( // Show only if there's content and an active doc
                <Box p="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
                  {' '}
                  {/* Alpha border */}
                  <Flex justify="end" gap="3">
                    {' '}
                    {/* Increased gap */}
                    <Button
                      onClick={handleTranslate}
                      disabled={isTranslating || !extractedText}
                      color="blue"
                      variant="solid" // Explicitly solid
                      size="2" // Consistent button size
                    >
                      {isTranslating ? <RefreshCw size={16} className="animate-spin mr-2" /> : null}
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
    font-size: var(--font-size-2); /* Use theme variable */
    border: 1px solid var(--gray-a5); /* Subtle border */
    border-radius: var(--radius-2); /* Rounded corners for table */
    overflow: hidden; /* Clip content to rounded corners */
  }
  .html-content th, .html-content td {
    border: 1px solid var(--gray-a5); /* Subtle border */
    padding: var(--space-2) var(--space-3); /* Use theme spacing */
    text-align: left;
    line-height: 1.5;
  }
  .html-content th {
    background-color: var(--gray-a3); /* Lighter header */
    font-weight: var(--font-weight-medium); /* Medium weight for headers */
    color: var(--gray-12);
  }
  .html-content tr:nth-child(even) td { /* Style even rows for better readability */
    background-color: var(--gray-a2); /* Very subtle striping */
  }
  .html-content tr:hover td { /* Hover effect for rows */
    background-color: var(--gray-a4);
  }
`
document.head.appendChild(style)
