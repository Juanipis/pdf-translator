import React from 'react'
import 'pdfjs-dist/web/pdf_viewer.css'
import { Box, Flex, IconButton, Text, Card, Tooltip, Badge } from '@radix-ui/themes'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  FileText,
  Image,
  Move,
  MousePointer,
  RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePdfViewer } from '../hooks/usePdfViewer'

interface PdfViewerProps {
  file: File | null
  onTextExtracted: (text: string) => void
  onImageExtracted: (base64Image: string) => void
}

export function PdfViewer({
  file,
  onTextExtracted,
  onImageExtracted
}: PdfViewerProps): React.ReactElement {
  const { t } = useTranslation()

  const {
    // Refs
    canvasRef,
    canvasContainerRef,
    containerRef,
    // State
    pdfDoc,
    viewState,
    selectionState,
    viewMode,
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    // Navigation
    goToPrevPage,
    goToNextPage,
    // Zoom
    zoomIn,
    zoomOut,
    // Toggle functions
    toggleViewMode,
    toggleFullscreen
  } = usePdfViewer({ file, onTextExtracted, onImageExtracted })

  // compute the canvas’s offset within its positioned parent
  const canvasOffset = {
    x: canvasRef.current?.offsetLeft || 0,
    y: canvasRef.current?.offsetTop || 0
  }

  return (
    <Flex direction="column" style={{ height: '100%', width: '100%' }} gap="2" ref={containerRef}>
      <Card>
        <Flex p="2" justify="between" align="center">
          <Flex gap="2" align="center">
            <Tooltip content={t('pdfViewer.previousPage')}>
              <IconButton
                onClick={goToPrevPage}
                disabled={viewState.pageNum <= 1 || !pdfDoc || viewState.isLoading}
                variant="soft"
                size="1"
              >
                <ChevronLeft size={16} />
              </IconButton>
            </Tooltip>
            <Text size="2">
              {t('pdfViewer.pageControls', {
                pageNum: pdfDoc ? viewState.pageNum : '-',
                numPages: pdfDoc ? viewState.numPages : '-'
              })}
            </Text>
            <Tooltip content={t('pdfViewer.nextPage')}>
              <IconButton
                onClick={goToNextPage}
                disabled={viewState.pageNum >= viewState.numPages || !pdfDoc || viewState.isLoading}
                variant="soft"
                size="1"
              >
                <ChevronRight size={16} />
              </IconButton>
            </Tooltip>
          </Flex>

          <Flex gap="2" align="center">
            <Tooltip content={t('pdfViewer.zoomOut')}>
              <IconButton
                onClick={zoomOut}
                disabled={!pdfDoc || viewState.isLoading}
                variant="soft"
                size="1"
              >
                <ZoomOut size={16} />
              </IconButton>
            </Tooltip>
            <Text size="2">{Math.round(viewState.scale * 100)}%</Text>
            <Tooltip content={t('pdfViewer.zoomIn')}>
              <IconButton
                onClick={zoomIn}
                disabled={!pdfDoc || viewState.isLoading}
                variant="soft"
                size="1"
              >
                <ZoomIn size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip
              content={
                viewMode.mode === 'select'
                  ? t('pdfViewer.switchToPanMode')
                  : t('pdfViewer.switchToSelectMode')
              }
            >
              <IconButton
                onClick={toggleViewMode}
                disabled={!pdfDoc}
                variant="soft"
                size="1"
                color={viewMode.mode === 'pan' ? 'amber' : 'gray'}
              >
                {viewMode.mode === 'select' ? <Move size={16} /> : <MousePointer size={16} />}
              </IconButton>
            </Tooltip>

            <Tooltip
              content={
                viewState.isFullscreen
                  ? t('pdfViewer.exitFullscreen')
                  : t('pdfViewer.enterFullscreen')
              }
            >
              <IconButton onClick={toggleFullscreen} disabled={!pdfDoc} variant="soft" size="1">
                {viewState.isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </IconButton>
            </Tooltip>
          </Flex>
        </Flex>
      </Card>

      <Box
        style={{
          flexGrow: 1,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--gray-a6)',
          borderRadius: 'var(--radius-3)',
          backgroundColor: 'var(--gray-3)'
        }}
      >
        {pdfDoc && (
          <Box
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 5,
              backgroundColor: 'var(--color-panel-translucent)',
              backdropFilter: 'blur(8px)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-3)',
              boxShadow: 'var(--shadow-2)'
            }}
          >
            <Flex gap="1" align="center">
              {viewMode.mode === 'select' ? (
                <>
                  <MousePointer size={14} />
                  <Text size="1">{t('pdfViewer.selectMode')}</Text>
                </>
              ) : (
                <>
                  <Move size={14} />
                  <Text size="1">{t('pdfViewer.panMode')}</Text>
                </>
              )}
            </Flex>
          </Box>
        )}

        {viewState.isLoading && (
          <Flex
            align="center"
            justify="center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.1)',
              zIndex: 10
            }}
          >
            <Text size="2" weight="bold">
              {t('pdfViewer.loading')}
            </Text>
          </Flex>
        )}

        {/* Show OCR processing indicator */}
        {viewState.isProcessingOcr && (
          <Flex
            align="center"
            justify="center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.2)',
              zIndex: 15,
              backdropFilter: 'blur(2px)'
            }}
          >
            <Box
              style={{
                backgroundColor: 'var(--color-panel-solid)',
                padding: '16px 24px',
                borderRadius: 'var(--radius-4)',
                boxShadow: 'var(--shadow-5)'
              }}
            >
              <Flex direction="column" align="center" gap="3">
                <RefreshCw size={24} className="animate-spin" />
                <Text size="2" weight="medium">
                  {t('pdfViewer.processingOcr')}
                </Text>
              </Flex>
            </Box>
          </Flex>
        )}

        {pdfDoc && (
          <Box
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              backgroundColor: 'var(--color-panel-translucent)',
              backdropFilter: 'blur(8px)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-3)',
              boxShadow: 'var(--shadow-3)'
            }}
          >
            <Text size="1">
              {viewMode.mode === 'select' ? t('pdfViewer.selectionHint') : t('pdfViewer.panHint')}
            </Text>
          </Box>
        )}

        {!pdfDoc && (
          <Flex align="center" justify="center" style={{ height: '100%' }}>
            <Text color="gray">{t('pdfViewer.noPdfLoaded')}</Text>
          </Flex>
        )}

        <Box
          ref={canvasContainerRef}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            position: 'relative'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: pdfDoc ? 'block' : 'none',
              margin: 'auto'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />

          {selectionState.selectionRect && (
            <Box
              style={{
                position: 'absolute',
                border: `2px dashed var(--${
                  selectionState.selectionType === 'text'
                    ? 'accent'
                    : selectionState.selectionType === 'image'
                      ? 'jade'
                      : 'accent'
                }-9)`,
                backgroundColor: `var(--${
                  selectionState.selectionType === 'text'
                    ? 'accent'
                    : selectionState.selectionType === 'image'
                      ? 'jade'
                      : 'accent'
                }-a3)`,
                left: selectionState.selectionRect.x + canvasOffset.x,
                top: selectionState.selectionRect.y + canvasOffset.y,
                width: selectionState.selectionRect.width,
                height: selectionState.selectionRect.height,
                pointerEvents: 'none',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
            >
              {selectionState.selectionType && (
                <Badge
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                  }}
                  color={selectionState.selectionType === 'text' ? 'blue' : 'green'}
                >
                  {selectionState.selectionType === 'text' ? (
                    <Flex gap="1" align="center">
                      <FileText size={12} />
                      <Text size="1">{t('pdfViewer.textSelected')}</Text>
                    </Flex>
                  ) : (
                    <Flex gap="1" align="center">
                      <Image size={12} />
                      <Text size="1">{t('pdfViewer.imageSelected')}</Text>
                    </Flex>
                  )}
                </Badge>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Flex>
  )
}
