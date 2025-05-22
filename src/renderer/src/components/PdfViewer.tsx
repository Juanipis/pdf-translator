import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
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
  MousePointer
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Configure worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionRect, setSelectionRect] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectionType, setSelectionType] = useState<'text' | 'image' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [viewMode, setViewMode] = useState<'select' | 'pan'>('select')
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [scrollPosition, setScrollPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const renderPage = useCallback(
    async (num: number): Promise<void> => {
      if (!pdfDoc) return

      setIsLoading(true)
      try {
        const page = await pdfDoc.getPage(num)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        await page.render(renderContext).promise
      } catch (error) {
        console.error('Error rendering page:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [pdfDoc, scale]
  )

  useEffect(() => {
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const typedArray = new Uint8Array(e.target.result as ArrayBuffer)
            const loadingTask = pdfjsLib.getDocument({ data: typedArray })
            const pdf = await loadingTask.promise
            setPdfDoc(pdf)
            setNumPages(pdf.numPages)
            setPageNum(1)
          } catch (error) {
            console.error('Error loading PDF:', error)
          } finally {
            setIsLoading(false)
          }
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      setPdfDoc(null)
      setNumPages(0)
      setPageNum(1)
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d')
        context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [file])

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum)
    }
  }, [pdfDoc, pageNum, renderPage])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'select' ? 'pan' : 'select'))
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!pdfDoc) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (viewMode === 'select') {
      setStartPoint({ x, y })
      setIsSelecting(true)
      setSelectionRect({ x, y, width: 0, height: 0 })
      setSelectionType(null)
    } else {
      setPanStart({ x: event.clientX, y: event.clientY })
      setIsPanning(true)

      if (canvasContainerRef.current) {
        setScrollPosition({
          x: canvasContainerRef.current.scrollLeft,
          y: canvasContainerRef.current.scrollTop
        })
      }

      if (canvas) {
        canvas.style.cursor = 'grabbing'
      }
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (viewMode === 'select' && isSelecting && startPoint && canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const currentX = event.clientX - rect.left
      const currentY = event.clientY - rect.top

      const newSelectionRect = {
        x: Math.min(startPoint.x, currentX),
        y: Math.min(startPoint.y, currentY),
        width: Math.abs(currentX - startPoint.x),
        height: Math.abs(currentY - startPoint.y)
      }
      setSelectionRect(newSelectionRect)
    } else if (viewMode === 'pan' && isPanning && panStart && canvasContainerRef.current) {
      const deltaX = panStart.x - event.clientX
      const deltaY = panStart.y - event.clientY

      canvasContainerRef.current.scrollLeft = scrollPosition.x + deltaX
      canvasContainerRef.current.scrollTop = scrollPosition.y + deltaY
    }
  }

  const handleMouseUp = async (event: React.MouseEvent<HTMLCanvasElement>): Promise<void> => {
    if (viewMode === 'select' && isSelecting && selectionRect && pdfDoc && canvasRef.current) {
      setIsSelecting(false)
      setStartPoint(null)

      if (selectionRect.width < 10 || selectionRect.height < 10) {
        setSelectionRect(null)
        return
      }

      try {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })

        let adjustedSelectionRect = { ...selectionRect }
        if (canvasContainerRef.current) {
          adjustedSelectionRect = {
            x: selectionRect.x + canvasContainerRef.current.scrollLeft,
            y: selectionRect.y + canvasContainerRef.current.scrollTop,
            width: selectionRect.width,
            height: selectionRect.height
          }
        }

        const pdfPointTopLeft = viewport.convertToPdfPoint(
          adjustedSelectionRect.x / scale,
          adjustedSelectionRect.y / scale
        )
        const pdfPointBottomRight = viewport.convertToPdfPoint(
          (adjustedSelectionRect.x + adjustedSelectionRect.width) / scale,
          (adjustedSelectionRect.y + adjustedSelectionRect.height) / scale
        )

        const pdfRect = [
          Math.min(pdfPointTopLeft[0], pdfPointBottomRight[0]),
          Math.min(pdfPointTopLeft[1], pdfPointBottomRight[1]),
          Math.max(pdfPointTopLeft[0], pdfPointBottomRight[0]),
          Math.max(pdfPointTopLeft[1], pdfPointBottomRight[1])
        ]

        // Intenta extraer texto primero
        try {
          const textContent = await page.getTextContent({
            includeMarkedContent: true,
            disableNormalization: false
          })

          let extractedText = ''
          let textFound = false

          for (const item of textContent.items) {
            // Verificar si el item es un TextItem (tiene propiedad str)
            if ('str' in item && item.str) {
              // Verificar si tiene transform
              if (item.transform && Array.isArray(item.transform) && item.transform.length >= 6) {
                const tx = item.transform
                const itemX = tx[4]
                const itemY = tx[5]

                // Obtener el ancho y alto, con verificaciones
                const itemWidth = 'width' in item ? item.width : 0
                const itemHeight = 'height' in item ? item.height : 0

                const itemRect = {
                  x1: itemX,
                  y1: itemY,
                  x2: itemX + itemWidth,
                  y2: itemY + itemHeight
                }

                const selectionPdfRect = {
                  x1: pdfRect[0],
                  y1: pdfRect[1],
                  x2: pdfRect[2],
                  y2: pdfRect[3]
                }

                // Verificar intersección
                if (
                  itemRect.x1 < selectionPdfRect.x2 &&
                  itemRect.x2 > selectionPdfRect.x1 &&
                  itemRect.y1 < selectionPdfRect.y2 &&
                  itemRect.y2 > selectionPdfRect.y1
                ) {
                  extractedText += item.str + ' '
                  textFound = true
                }
              }
            }
          }

          if (textFound && extractedText.trim()) {
            setSelectionType('text')
            onTextExtracted(extractedText.trim())
          } else {
            // Si no hay texto, capturar como imagen
            captureImageSelection(adjustedSelectionRect)
          }
        } catch (textError) {
          console.error('Error extracting text:', textError)
          // Si falla la extracción de texto, intentar capturar como imagen
          captureImageSelection(adjustedSelectionRect)
        }
      } catch (error) {
        console.error('Error extracting text or image:', error)
        // No hacer nada o mostrar un mensaje de error al usuario
      }

      // Mantener el rectángulo visible brevemente antes de ocultarlo
      setTimeout(() => {
        setSelectionRect(null)
        setSelectionType(null)
      }, 1000)
    } else if (viewMode === 'pan' && isPanning) {
      setIsPanning(false)
      setPanStart(null)

      if (canvasRef.current) {
        canvasRef.current.style.cursor = viewMode === 'select' ? 'crosshair' : 'grab'
      }
    }
  }

  // Función auxiliar para capturar la selección como imagen
  const captureImageSelection = (rect: { x: number; y: number; width: number; height: number }) => {
    try {
      setSelectionType('image')
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = rect.width
      tempCanvas.height = rect.height
      const tempCtx = tempCanvas.getContext('2d')

      if (tempCtx && canvasRef.current) {
        // Ajustar por el desplazamiento del scroll
        tempCtx.drawImage(
          canvasRef.current,
          rect.x - (canvasContainerRef.current?.scrollLeft || 0),
          rect.y - (canvasContainerRef.current?.scrollTop || 0),
          rect.width,
          rect.height,
          0,
          0,
          rect.width,
          rect.height
        )
        const base64Image = tempCanvas.toDataURL('image/png')
        onImageExtracted(base64Image)
      }
    } catch (imgError) {
      console.error('Error capturing image selection:', imgError)
    }
  }

  const handleMouseLeave = (): void => {
    if (isSelecting) {
      setIsSelecting(false)
      setStartPoint(null)
      setSelectionRect(null)
    }

    if (isPanning) {
      setIsPanning(false)
      setPanStart(null)

      if (canvasRef.current) {
        canvasRef.current.style.cursor = viewMode === 'select' ? 'crosshair' : 'grab'
      }
    }
  }

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = viewMode === 'select' ? 'crosshair' : 'grab'
    }
  }, [viewMode])

  const onPrevPage = (): void => {
    if (pageNum <= 1) return
    setPageNum(pageNum - 1)
  }

  const onNextPage = (): void => {
    if (pageNum >= numPages) return
    setPageNum(pageNum + 1)
  }

  const onZoomIn = (): void => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3.0))
  }

  const onZoomOut = (): void => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }

  return (
    <Flex direction="column" style={{ height: '100%', width: '100%' }} gap="2" ref={containerRef}>
      <Card>
        <Flex p="2" justify="between" align="center">
          <Flex gap="2" align="center">
            <Tooltip content={t('pdfViewer.previousPage')}>
              <IconButton
                onClick={onPrevPage}
                disabled={pageNum <= 1 || !pdfDoc || isLoading}
                variant="soft"
                size="1"
              >
                <ChevronLeft size={16} />
              </IconButton>
            </Tooltip>
            <Text size="2">
              {t('pdfViewer.pageControls', {
                pageNum: pdfDoc ? pageNum : '-',
                numPages: pdfDoc ? numPages : '-'
              })}
            </Text>
            <Tooltip content={t('pdfViewer.nextPage')}>
              <IconButton
                onClick={onNextPage}
                disabled={pageNum >= numPages || !pdfDoc || isLoading}
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
                onClick={onZoomOut}
                disabled={!pdfDoc || isLoading}
                variant="soft"
                size="1"
              >
                <ZoomOut size={16} />
              </IconButton>
            </Tooltip>
            <Text size="2">{Math.round(scale * 100)}%</Text>
            <Tooltip content={t('pdfViewer.zoomIn')}>
              <IconButton
                onClick={onZoomIn}
                disabled={!pdfDoc || isLoading}
                variant="soft"
                size="1"
              >
                <ZoomIn size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip
              content={
                viewMode === 'select'
                  ? t('pdfViewer.switchToPanMode')
                  : t('pdfViewer.switchToSelectMode')
              }
            >
              <IconButton
                onClick={toggleViewMode}
                disabled={!pdfDoc}
                variant="soft"
                size="1"
                color={viewMode === 'pan' ? 'amber' : 'gray'}
              >
                {viewMode === 'select' ? <Move size={16} /> : <MousePointer size={16} />}
              </IconButton>
            </Tooltip>

            <Tooltip
              content={
                isFullscreen ? t('pdfViewer.exitFullscreen') : t('pdfViewer.enterFullscreen')
              }
            >
              <IconButton onClick={toggleFullscreen} disabled={!pdfDoc} variant="soft" size="1">
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
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
              {viewMode === 'select' ? (
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

        {isLoading && (
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
              {viewMode === 'select' ? t('pdfViewer.selectionHint') : t('pdfViewer.panHint')}
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

          {selectionRect && (
            <Box
              style={{
                position: 'absolute',
                border: `2px dashed var(--${
                  selectionType === 'text'
                    ? 'accent'
                    : selectionType === 'image'
                      ? 'jade'
                      : 'accent'
                }-9)`,
                backgroundColor: `var(--${
                  selectionType === 'text'
                    ? 'accent'
                    : selectionType === 'image'
                      ? 'jade'
                      : 'accent'
                }-a3)`,
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.width,
                height: selectionRect.height,
                pointerEvents: 'none',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
            >
              {selectionType && (
                <Badge
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                  }}
                  color={selectionType === 'text' ? 'blue' : 'green'}
                >
                  {selectionType === 'text' ? (
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
