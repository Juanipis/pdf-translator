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
import { EmptyState } from './EmptyState' // Import EmptyState

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
      <Card style={{ boxShadow: 'var(--shadow-2)' }}>
        {' '}
        {/* Added subtle shadow */}
        <Flex p="2" justify="between" align="center">
          <Flex gap="2" align="center">
            <Tooltip content={t('pdfViewer.previousPage')}>
              <IconButton
                onClick={goToPrevPage}
                disabled={viewState.pageNum <= 1 || !pdfDoc || viewState.isLoading}
                variant="ghost" // Ghost variant for cleaner look
                size="1"
              >
                <ChevronLeft size={18} /> {/* Slightly larger icon */}
              </IconButton>
            </Tooltip>
            <Text size="2" weight="medium">
              {' '}
              {/* Added weight */}
              {t('pdfViewer.pageControls', {
                pageNum: pdfDoc ? viewState.pageNum : '-',
                numPages: pdfDoc ? viewState.numPages : '-'
              })}
            </Text>
            <Tooltip content={t('pdfViewer.nextPage')}>
              <IconButton
                onClick={goToNextPage}
                disabled={viewState.pageNum >= viewState.numPages || !pdfDoc || viewState.isLoading}
                variant="ghost" // Ghost variant
                size="1"
              >
                <ChevronRight size={18} /> {/* Slightly larger icon */}
              </IconButton>
            </Tooltip>
          </Flex>

          <Flex gap="2" align="center">
            <Tooltip content={t('pdfViewer.zoomOut')}>
              <IconButton
                onClick={zoomOut}
                disabled={!pdfDoc || viewState.isLoading}
                variant="ghost" // Ghost variant
                size="1"
              >
                <ZoomOut size={18} /> {/* Slightly larger icon */}
              </IconButton>
            </Tooltip>
            <Text size="2" weight="medium" style={{ minWidth: '40px', textAlign: 'center' }}>
              {' '}
              {/* Added min-width and weight */}
              {Math.round(viewState.scale * 100)}%
            </Text>
            <Tooltip content={t('pdfViewer.zoomIn')}>
              <IconButton
                onClick={zoomIn}
                disabled={!pdfDoc || viewState.isLoading}
                variant="ghost" // Ghost variant
                size="1"
              >
                <ZoomIn size={18} /> {/* Slightly larger icon */}
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
                variant="ghost" // Ghost variant
                size="1"
                color={viewMode.mode === 'pan' ? 'amber' : 'gray'}
              >
                {viewMode.mode === 'select' ? <Move size={18} /> : <MousePointer size={18} />}{' '}
                {/* Slightly larger icon */}
              </IconButton>
            </Tooltip>

            <Tooltip
              content={
                viewState.isFullscreen
                  ? t('pdfViewer.exitFullscreen')
                  : t('pdfViewer.enterFullscreen')
              }
            >
              <IconButton onClick={toggleFullscreen} disabled={!pdfDoc} variant="ghost" size="1">
                {' '}
                {/* Ghost variant */}
                {viewState.isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}{' '}
                {/* Slightly larger icon */}
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
          border: '1px solid var(--gray-a5)', // More subtle border
          borderRadius: 'var(--radius-3)',
          backgroundColor: 'var(--gray-a2)', // Lighter background for canvas area
          boxShadow: 'var(--shadow-1)' // Inner shadow for depth
        }}
      >
        {pdfDoc && (
          <Box
            style={{
              position: 'absolute',
              top: '12px', // Adjusted position
              right: '12px', // Adjusted position
              zIndex: 5,
              backgroundColor: 'var(--color-panel-translucent)',
              backdropFilter: 'blur(10px)', // Stronger blur
              padding: '6px 10px', // Adjusted padding
              borderRadius: 'var(--radius-3)',
              boxShadow: 'var(--shadow-3)' // Slightly stronger shadow
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
              backgroundColor: 'var(--black-a6)', // Use alpha color for overlay
              zIndex: 10,
              backdropFilter: 'blur(2px)' // Add blur for loading
            }}
          >
            <Flex direction="column" align="center" gap="2" style={{ color: 'var(--gray-12)' }}>
              <RefreshCw size={28} className="animate-spin" /> {/* Larger icon */}
              <Text size="3" weight="medium">
                {' '}
                {/* Adjusted size and weight */}
                {t('pdfViewer.loading')}
              </Text>
            </Flex>
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
              backgroundColor: 'var(--black-a8)', // Darker overlay
              zIndex: 15,
              backdropFilter: 'blur(4px)' // Stronger blur
            }}
          >
            <Box
              style={{
                backgroundColor: 'var(--color-panel-solid)',
                padding: '20px 28px', // Increased padding
                borderRadius: 'var(--radius-4)', // Larger radius
                boxShadow: 'var(--shadow-5)'
              }}
            >
              <Flex direction="column" align="center" gap="3">
                <RefreshCw size={32} className="animate-spin" color="var(--accent-9)" />{' '}
                {/* Accent color */}
                <Text size="3" weight="medium">
                  {' '}
                  {/* Adjusted size */}
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
              bottom: '16px', // Adjusted position
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              backgroundColor: 'var(--color-panel-translucent)',
              backdropFilter: 'blur(10px)', // Stronger blur
              padding: '8px 14px', // Adjusted padding
              borderRadius: 'var(--radius-3)',
              boxShadow: 'var(--shadow-3)' // Slightly stronger shadow
            }}
          >
            <Text size="1">
              {viewMode.mode === 'select' ? t('pdfViewer.selectionHint') : t('pdfViewer.panHint')}
            </Text>
          </Box>
        )}

        {!pdfDoc && (
          // Use EmptyState when no PDF is loaded
          <EmptyState
            icon={<FileText size={52} strokeWidth={1.5} />} // Adjusted icon
            title={t('pdfViewer.noPdfLoaded')}
            description={t('pdfViewer.selectFileHint')} // Add a hint
          />
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
                    ? 'blue' // Use direct color name for clarity
                    : selectionState.selectionType === 'image'
                      ? 'green' // Use direct color name
                      : 'blue' // Fallback
                }-9)`,
                backgroundColor: `var(--${
                  selectionState.selectionType === 'text'
                    ? 'blue'
                    : selectionState.selectionType === 'image'
                      ? 'green'
                      : 'blue'
                }-a4)`, // Slightly more opaque alpha
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
                    top: '-20px', // Adjusted position for better visibility
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    padding: '2px 6px' // Add padding to badge
                  }}
                  color={selectionState.selectionType === 'text' ? 'blue' : 'green'}
                  variant="soft" // Softer badge
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
