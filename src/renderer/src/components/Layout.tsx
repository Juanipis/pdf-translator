import { Button, Flex, Box, Heading, Card } from '@radix-ui/themes'
import { UploadCloud, BookOpenCheck } from 'lucide-react'
import { SettingsDialog } from './SettingsDialog'
import { PdfViewer } from './PdfViewer'
import { TranslationPanel } from './TranslationPanel'
import { useTranslation } from 'react-i18next'
import React, { useState, useRef } from 'react'

export function Layout(): React.ReactElement {
  const { t } = useTranslation()
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

  return (
    <Flex direction="column" style={{ height: '100vh', backgroundColor: 'var(--gray-1)' }}>
      {/* Barra superior global */}
      <Box
        style={{
          borderBottom: '1px solid var(--gray-5)',
          backgroundColor: 'var(--color-panel-solid)'
        }}
        px="3"
        py="2"
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <BookOpenCheck size={24} color="var(--accent-9)" />
            <Heading as="h1" size="4">
              {t('app.title')}
            </Heading>
          </Flex>
          <SettingsDialog />
        </Flex>
      </Box>

      {/* Layout de 2 columnas */}
      <Flex flexGrow="1" p="3" gap="3" style={{ overflow: 'hidden' }}>
        {/* Columna izquierda */}
        <Flex direction="column" style={{ width: '50%' }} gap="3">
          <Card>
            <Flex align="center" justify="between" p="3">
              <Heading as="h2" size="3">
                {t('layout.sourceDocumentTitle')}
              </Heading>
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button onClick={handleUploadClick}>
                <UploadCloud size={16} />
                {selectedFile ? selectedFile.name : t('layout.uploadPdfButton')}
              </Button>
            </Flex>
          </Card>

          {/* Zona de render PDF */}
          <Card style={{ flexGrow: 1, overflow: 'hidden' }}>
            <PdfViewer
              file={selectedFile}
              onTextExtracted={handleTextExtracted}
              onImageExtracted={handleImageExtracted}
            />
          </Card>
        </Flex>

        {/* Columna derecha */}
        <TranslationPanel extractedText={extractedText} extractedImage={extractedImage} />
      </Flex>
    </Flex>
  )
}
