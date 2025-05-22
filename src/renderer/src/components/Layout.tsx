import { Button, Flex, Box, Heading, Card } from '@radix-ui/themes'
import { UploadCloud, FileText, BookOpenCheck } from 'lucide-react'
import { SettingsDialog } from './SettingsDialog'
import { PdfMock } from './PdfMock'
import { EmptyState } from './EmptyState'
import { useTranslation } from 'react-i18next'

export function Layout(): React.ReactElement {
  const { t } = useTranslation()

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
              <Button>
                <UploadCloud size={16} />
                {t('layout.uploadPdfButton')}
              </Button>
            </Flex>
          </Card>

          {/* Zona de render mock de PDF */}
          <Card style={{ flexGrow: 1, overflow: 'hidden' }}>
            <PdfMock />
          </Card>

          {/* Zona "No PDF Loaded" */}
        </Flex>

        {/* Columna derecha */}
        <Card style={{ width: '50%' }}>
          <Flex direction="column" style={{ height: '100%' }}>
            <Box
              p="3"
              style={{
                borderBottom: '1px solid var(--gray-5)'
              }}
            >
              <Heading as="h2" size="3">
                {t('layout.translatedContentTitle')}
              </Heading>
            </Box>
            <Flex flexGrow="1" align="center" justify="center" p="3">
              <EmptyState
                icon={<FileText size={48} />}
                title={t('layout.noContentToTranslateTitle')}
                description={t('layout.noContentToTranslateDescription')}
              />
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  )
}
