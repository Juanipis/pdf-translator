import { Button, Flex, Box, Heading, Card, IconButton, Tooltip } from '@radix-ui/themes'
import { UploadCloud, BookOpenCheck, Moon, Sun, X } from 'lucide-react'
import { SettingsDialog } from './SettingsDialog'
import { PdfViewer } from './PdfViewer'
import { TranslationPanel } from './TranslationPanel'
import { useTranslation } from 'react-i18next'
import React, { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { EmptyState } from './EmptyState'

export function Layout(): React.ReactElement {
  const { t } = useTranslation()
  const { mode, toggleTheme } = useTheme()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [extractedImage, setExtractedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setExtractedText(null) // Reset extracted content when new file is loaded
      setExtractedImage(null)
    }
  }

  const handleUploadClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleTextExtracted = (text: string): void => {
    setExtractedText(text)
    setExtractedImage(null) // Clear image if text is found
  }

  const handleImageExtracted = (base64Image: string): void => {
    setExtractedImage(base64Image)
    setExtractedText(null) // Clear text if image is captured
  }

  const clearSelectedFile = (): void => {
    setSelectedFile(null)
    setExtractedText(null)
    setExtractedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Flex direction="column" style={{ height: '100vh', backgroundColor: 'var(--gray-1)' }}>
      {' '}
      {/* Use theme background */}
      {/* Header bar */}
      <Box
        style={{
          borderBottom: '1px solid var(--gray-a5)', // More subtle border
          backgroundColor: 'var(--color-panel-solid)', // Use panel color for header
          boxShadow: 'var(--shadow-2)' // Add a subtle shadow to the header
        }}
        px="4"
        py="2" // Reduced padding for a slimmer header
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            {' '}
            {/* Increased gap */}
            <BookOpenCheck size={28} color="var(--accent-10)" />{' '}
            {/* Slightly larger and darker icon */}
            <Heading as="h1" size="5" weight="medium">
              {' '}
              {/* Adjusted size and weight */}
              {t('app.title')}
            </Heading>
          </Flex>
          <Flex align="center" gap="3">
            {' '}
            {/* Increased gap */}
            <Tooltip
              content={mode === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
            >
              <IconButton size="2" variant="ghost" color="gray" onClick={toggleTheme}>
                {' '}
                {/* Explicit color */}
                {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}{' '}
                {/* Slightly larger icons */}
              </IconButton>
            </Tooltip>
            <SettingsDialog />
          </Flex>
        </Flex>
      </Box>
      {/* Main content - 2 column layout */}
      <Flex flexGrow="1" p="4" gap="4" style={{ overflow: 'hidden' }}>
        {/* Left column */}
        <Flex direction="column" style={{ width: '50%' }} gap="4">
          <Card style={{ boxShadow: 'var(--shadow-2)' }}>
            {' '}
            {/* Added subtle shadow */}
            <Flex align="center" justify="between" p="3">
              <Heading as="h2" size="4" weight="medium">
                {' '}
                {/* Adjusted size and weight */}
                {t('layout.sourceDocumentTitle')}
              </Heading>
              <Flex gap="2" align="center">
                {' '}
                {/* Ensure vertical alignment */}
                {selectedFile && (
                  <Tooltip content={t('layout.clearFile')}>
                    <IconButton variant="soft" color="red" onClick={clearSelectedFile} size="2">
                      {' '}
                      {/* Consistent size */}
                      <X size={16} />
                    </IconButton>
                  </Tooltip>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  onClick={handleUploadClick}
                  size="2"
                  variant={selectedFile ? 'soft' : 'solid'}
                >
                  {' '}
                  {/* Change variant if file selected */}
                  <UploadCloud
                    size={16}
                    style={{ marginRight: selectedFile ? '0' : 'var(--space-2)' }}
                  />
                  {selectedFile
                    ? selectedFile.name.length > 20
                      ? `${selectedFile.name.substring(0, 17)}...`
                      : selectedFile.name
                    : t('layout.uploadPdfButton')}
                </Button>
              </Flex>
            </Flex>
          </Card>

          {/* PDF Viewer area */}
          <Card
            style={{
              flexGrow: 1,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--shadow-3)'
            }}
          >
            {' '}
            {/* Stronger shadow */}
            {!selectedFile ? (
              <EmptyState
                icon={<UploadCloud size={52} strokeWidth={1.5} />} // Adjusted icon
                title={t('pdfViewer.emptyState.title')}
                description={t('pdfViewer.emptyState.description')}
                actionLabel={t('layout.uploadPdfButton')} // Add action to EmptyState
                onAction={handleUploadClick} // Trigger file upload
              />
            ) : (
              <PdfViewer
                file={selectedFile}
                onTextExtracted={handleTextExtracted}
                onImageExtracted={handleImageExtracted}
              />
            )}
          </Card>
        </Flex>

        {/* Right column */}
        <Box style={{ width: '50%' }}>
          <TranslationPanel
            extractedText={extractedText}
            extractedImage={extractedImage}
            hasActiveDocument={!!selectedFile}
            setExtractedText={handleTextExtracted}
          />
        </Box>
      </Flex>
    </Flex>
  )
}
