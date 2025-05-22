import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import { Box, Flex, IconButton, Text, Card } from '@radix-ui/themes'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
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

  const renderPage = useCallback(
    async (num: number): Promise<void> => {
      if (!pdfDoc) return
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
    },
    [pdfDoc, scale]
  )

  useEffect(() => {
    if (file) {
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
            // Handle PDF loading error (e.g., show a message to the user)
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

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!pdfDoc) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    setStartPoint({ x, y })
    setIsSelecting(true)
    setSelectionRect({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isSelecting || !startPoint || !canvasRef.current) return
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
  }

  const handleMouseUp = async (): Promise<void> => {
    if (!isSelecting || !selectionRect || !pdfDoc || !canvasRef.current) return
    setIsSelecting(false)
    setStartPoint(null)

    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1 }) // Use original scale for text extraction

    // Convert selectionRect from canvas coordinates to PDF page coordinates
    const pdfPointTopLeft = viewport.convertToPdfPoint(
      selectionRect.x / scale,
      selectionRect.y / scale
    )
    const pdfPointBottomRight = viewport.convertToPdfPoint(
      (selectionRect.x + selectionRect.width) / scale,
      (selectionRect.y + selectionRect.height) / scale
    )

    const pdfRect = [
      Math.min(pdfPointTopLeft[0], pdfPointBottomRight[0]),
      Math.min(pdfPointTopLeft[1], pdfPointBottomRight[1]),
      Math.max(pdfPointTopLeft[0], pdfPointBottomRight[0]),
      Math.max(pdfPointTopLeft[1], pdfPointBottomRight[1])
    ]

    try {
      const textContent = await page.getTextContent({
        // @ts-ignore - PDF.js typings are incomplete for these options
        includeMarkedContent: true,
        // @ts-ignore - PDF.js typings are incomplete for these options
        disableNormalization: false
      })

      let extractedText = ''
      for (const item of textContent.items) {
        // @ts-ignore - PDF.js typings are incomplete for transform property
        const tx = item.transform
        // Approximate check if item is within selection.
        // This is a simplified check and might need refinement for accuracy.
        // It checks if the bottom-left corner of the text item is within the selection rectangle.
        // PDF coordinate system has origin at bottom-left.
        const itemX = tx[4]
        const itemY = tx[5]
        // @ts-ignore - PDF.js typings are incomplete for width property
        const itemWidth = item.width
        // @ts-ignore - PDF.js typings are incomplete for height property
        const itemHeight = item.height

        // Check if the item's bounding box intersects with the selection rectangle
        // This is a more robust check than just checking a single point
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

        // Check for intersection
        if (
          itemRect.x1 < selectionPdfRect.x2 &&
          itemRect.x2 > selectionPdfRect.x1 &&
          itemRect.y1 < selectionPdfRect.y2 &&
          itemRect.y2 > selectionPdfRect.y1
        ) {
          // @ts-ignore - PDF.js typings are incomplete for str property
          extractedText += item.str + ' '
        }
      }

      if (extractedText.trim()) {
        console.log('Extracted Text:', extractedText.trim())
        onTextExtracted(extractedText.trim())
      } else {
        // If no text, capture as image
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = selectionRect.width
        tempCanvas.height = selectionRect.height
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx && canvasRef.current) {
          tempCtx.drawImage(
            canvasRef.current,
            selectionRect.x,
            selectionRect.y,
            selectionRect.width,
            selectionRect.height,
            0,
            0,
            selectionRect.width,
            selectionRect.height
          )
          const base64Image = tempCanvas.toDataURL('image/png')
          console.log('Extracted Image (Base64):', base64Image)
          onImageExtracted(base64Image)
        }
      }
    } catch (error) {
      console.error('Error extracting text or image:', error)
      // Fallback to image capture if text extraction fails
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = selectionRect.width
      tempCanvas.height = selectionRect.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx && canvasRef.current) {
        tempCtx.drawImage(
          canvasRef.current,
          selectionRect.x,
          selectionRect.y,
          selectionRect.width,
          selectionRect.height,
          0,
          0,
          selectionRect.width,
          selectionRect.height
        )
        const base64Image = tempCanvas.toDataURL('image/png')
        console.log('Extracted Image (Base64) due to error:', base64Image)
        onImageExtracted(base64Image)
      }
    }
    setSelectionRect(null) // Clear selection rectangle after processing
  }

  const onPrevPage = (): void => {
    if (pageNum <= 1) return
    setPageNum(pageNum - 1)
  }

  const onNextPage = (): void => {
    if (pageNum >= numPages) return
    setPageNum(pageNum + 1)
  }

  const onZoomIn = (): void => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3.0)) // Max zoom 3.0
  }

  const onZoomOut = (): void => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)) // Min zoom 0.5
  }

  return (
    <Flex direction="column" style={{ height: '100%', width: '100%' }} gap="2">
      {/* PDF Controls */}
      <Card>
        <Flex p="2" justify="between" align="center">
          <Flex gap="2" align="center">
            <IconButton onClick={onPrevPage} disabled={pageNum <= 1 || !pdfDoc} variant="soft">
              <ChevronLeft size={16} />
            </IconButton>
            <Text size="2">
              {t('pdfViewer.pageControls', {
                pageNum: pdfDoc ? pageNum : '-',
                numPages: pdfDoc ? numPages : '-'
              })}
            </Text>
            <IconButton
              onClick={onNextPage}
              disabled={pageNum >= numPages || !pdfDoc}
              variant="soft"
            >
              <ChevronRight size={16} />
            </IconButton>
          </Flex>
          <Flex gap="2" align="center">
            <IconButton onClick={onZoomOut} disabled={!pdfDoc} variant="soft">
              <ZoomOut size={16} />
            </IconButton>
            <Text size="2">{Math.round(scale * 100)}%</Text>
            <IconButton onClick={onZoomIn} disabled={!pdfDoc} variant="soft">
              <ZoomIn size={16} />
            </IconButton>
          </Flex>
        </Flex>
      </Card>

      {/* PDF Canvas */}
      <Box
        style={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid var(--gray-a6)',
          borderRadius: 'var(--radius-3)'
        }}
      >
        {!pdfDoc && (
          <Flex align="center" justify="center" style={{ height: '100%' }}>
            <Text color="gray">{t('pdfViewer.noPdfLoaded')}</Text>
          </Flex>
        )}
        <canvas
          ref={canvasRef}
          style={{
            display: pdfDoc ? 'block' : 'none',
            margin: 'auto',
            cursor: pdfDoc ? 'crosshair' : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            // Reset selection if mouse leaves canvas while selecting
            if (isSelecting) {
              setIsSelecting(false)
              setStartPoint(null)
              setSelectionRect(null)
            }
          }}
        />
        {isSelecting && selectionRect && (
          <Box
            style={{
              position: 'absolute',
              border: '1px dashed var(--accent-9)',
              backgroundColor: 'var(--accent-a3)',
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
              pointerEvents: 'none' // Make sure it doesn't interfere with mouse events on canvas
            }}
          />
        )}
      </Box>
    </Flex>
  )
}
