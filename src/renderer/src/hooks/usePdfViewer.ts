import { useState, useRef, useCallback, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { pdfService, PdfSelection } from '../service/pdf'
import { getOcrService } from '../service'

export interface ViewState {
  pageNum: number
  numPages: number
  scale: number
  isLoading: boolean
  isFullscreen: boolean
  isProcessingOcr: boolean
}

export interface SelectionState {
  isSelecting: boolean
  selectionRect: PdfSelection | null
  startPoint: { x: number; y: number } | null
  selectionType: 'text' | 'image' | null
}

export interface ViewMode {
  mode: 'select' | 'pan'
  isPanning: boolean
  panStart: { x: number; y: number } | null
  scrollPosition: { x: number; y: number }
}

export interface UsePdfViewerProps {
  file: File | null
  onTextExtracted: (text: string) => void
  onImageExtracted: (base64Image: string) => void
}

export interface UsePdfViewerReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  canvasContainerRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  pdfDoc: pdfjsLib.PDFDocumentProxy | null
  viewState: ViewState
  selectionState: SelectionState
  viewMode: ViewMode
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: () => Promise<void>
  handleMouseLeave: () => void
  goToPrevPage: () => void
  goToNextPage: () => void
  zoomIn: () => void
  zoomOut: () => void
  toggleViewMode: () => void
  toggleFullscreen: () => void
}

export function usePdfViewer({
  file,
  onTextExtracted,
  onImageExtracted
}: UsePdfViewerProps): UsePdfViewerReturn {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // PDF Document state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)

  // View state
  const [viewState, setViewState] = useState<ViewState>({
    pageNum: 1,
    numPages: 0,
    scale: 1.0,
    isLoading: false,
    isFullscreen: false,
    isProcessingOcr: false
  })

  // Selection state
  const [selectionState, setSelectionState] = useState<SelectionState>({
    isSelecting: false,
    selectionRect: null,
    startPoint: null,
    selectionType: null
  })

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>({
    mode: 'select',
    isPanning: false,
    panStart: null,
    scrollPosition: { x: 0, y: 0 }
  })

  // Get OCR service
  const ocrService = getOcrService()

  // Render page function
  const renderPage = useCallback(
    async (num: number): Promise<void> => {
      if (!pdfDoc || !canvasRef.current) return

      setViewState((prev) => ({ ...prev, isLoading: true }))

      try {
        await pdfService.renderPage(pdfDoc, num, canvasRef.current, viewState.scale)
      } catch (error) {
        console.error('Error rendering page:', error)
      } finally {
        setViewState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [pdfDoc, viewState.scale]
  )

  // Load PDF when file changes
  useEffect(() => {
    if (file) {
      setViewState((prev) => ({ ...prev, isLoading: true }))

      pdfService
        .loadDocument(file)
        .then((pdf) => {
          setPdfDoc(pdf)
          setViewState((prev) => ({
            ...prev,
            numPages: pdf.numPages,
            pageNum: 1,
            isLoading: false
          }))
        })
        .catch((error) => {
          console.error('Error loading PDF:', error)
          setViewState((prev) => ({ ...prev, isLoading: false }))
        })
    } else {
      setPdfDoc(null)
      setViewState((prev) => ({
        ...prev,
        numPages: 0,
        pageNum: 1
      }))

      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d')
        context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [file])

  // Render page when dependencies change
  useEffect(() => {
    if (pdfDoc) {
      renderPage(viewState.pageNum)
    }
  }, [pdfDoc, viewState.pageNum, renderPage])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setViewState((prev) => ({ ...prev, isFullscreen: !!document.fullscreenElement }))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Update cursor style based on view mode
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = viewMode.mode === 'select' ? 'crosshair' : 'grab'
    }
  }, [viewMode.mode])

  // Get precise canvas coordinates with proper offset calculation
  const getCanvasCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()

      // Get the canvas position relative to the viewport
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      return { x, y }
    },
    []
  )

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      if (!pdfDoc) return

      const coords = getCanvasCoordinates(event)

      if (viewMode.mode === 'select') {
        setSelectionState({
          isSelecting: true,
          startPoint: coords,
          selectionRect: { x: coords.x, y: coords.y, width: 0, height: 0 },
          selectionType: null
        })
      } else {
        setViewMode((prev) => ({
          ...prev,
          isPanning: true,
          panStart: { x: event.clientX, y: event.clientY },
          scrollPosition: {
            x: canvasContainerRef.current?.scrollLeft || 0,
            y: canvasContainerRef.current?.scrollTop || 0
          }
        }))

        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grabbing'
        }
      }
    },
    [pdfDoc, viewMode.mode, getCanvasCoordinates]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      if (viewMode.mode === 'select' && selectionState.isSelecting && selectionState.startPoint) {
        const coords = getCanvasCoordinates(event)

        const newSelectionRect: PdfSelection = {
          x: Math.min(selectionState.startPoint.x, coords.x),
          y: Math.min(selectionState.startPoint.y, coords.y),
          width: Math.abs(coords.x - selectionState.startPoint.x),
          height: Math.abs(coords.y - selectionState.startPoint.y)
        }

        setSelectionState((prev) => ({
          ...prev,
          selectionRect: newSelectionRect
        }))
      } else if (
        viewMode.mode === 'pan' &&
        viewMode.isPanning &&
        viewMode.panStart &&
        canvasContainerRef.current
      ) {
        const deltaX = viewMode.panStart.x - event.clientX
        const deltaY = viewMode.panStart.y - event.clientY

        canvasContainerRef.current.scrollLeft = viewMode.scrollPosition.x + deltaX
        canvasContainerRef.current.scrollTop = viewMode.scrollPosition.y + deltaY
      }
    },
    [viewMode, selectionState, getCanvasCoordinates]
  )

  const handleImageSelection = useCallback(
    async (rect: PdfSelection): Promise<void> => {
      if (!canvasRef.current) return

      try {
        setSelectionState((prev) => ({ ...prev, selectionType: 'image' }))
        setViewState((prev) => ({ ...prev, isProcessingOcr: true }))

        const base64Image = pdfService.captureImageFromSelection(canvasRef.current, rect)

        // Always send the captured image first
        onImageExtracted(base64Image)

        // Process with OCR service in background
        const result = await ocrService.processImage(base64Image, {
          detectLanguage: true,
          returnBoundingBoxes: false
        })

        // If OCR finds text, also send the extracted text
        if (result.text && result.text.trim().length > 0) {
          onTextExtracted(result.text.trim())
        }
      } catch (err) {
        console.error('OCR processing error:', err)
        // Still show the image even if OCR fails
        if (canvasRef.current) {
          const base64Image = pdfService.captureImageFromSelection(canvasRef.current, rect)
          onImageExtracted(base64Image)
        }
      } finally {
        setViewState((prev) => ({ ...prev, isProcessingOcr: false }))
      }
    },
    [ocrService, onTextExtracted, onImageExtracted]
  )

  const handleMouseUp = useCallback(async (): Promise<void> => {
    if (
      viewMode.mode === 'select' &&
      selectionState.isSelecting &&
      selectionState.selectionRect &&
      pdfDoc
    ) {
      if (selectionState.selectionRect.width < 10 || selectionState.selectionRect.height < 10) {
        setSelectionState({
          isSelecting: false,
          selectionRect: null,
          startPoint: null,
          selectionType: null
        })
        return
      }

      try {
        // Get scroll positions for accurate coordinate calculation
        const scrollLeft = canvasContainerRef.current?.scrollLeft || 0
        const scrollTop = canvasContainerRef.current?.scrollTop || 0

        // Try to extract text first
        const extractedText = await pdfService.extractTextFromSelection(
          pdfDoc,
          viewState.pageNum,
          selectionState.selectionRect,
          viewState.scale,
          scrollLeft,
          scrollTop
        )

        if (extractedText && extractedText.trim()) {
          setSelectionState((prev) => ({ ...prev, selectionType: 'text' }))
          onTextExtracted(extractedText)
        } else {
          // If no text found, capture as image
          await handleImageSelection(selectionState.selectionRect)
        }
      } catch (error) {
        console.error('Error extracting content:', error)
        await handleImageSelection(selectionState.selectionRect)
      }

      // Hide selection after a delay
      setTimeout(() => {
        setSelectionState({
          isSelecting: false,
          selectionRect: null,
          startPoint: null,
          selectionType: null
        })
      }, 1000)

      setSelectionState((prev) => ({ ...prev, isSelecting: false, startPoint: null }))
    } else if (viewMode.mode === 'pan' && viewMode.isPanning) {
      setViewMode((prev) => ({
        ...prev,
        isPanning: false,
        panStart: null
      }))

      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab'
      }
    }
  }, [viewMode, selectionState, pdfDoc, viewState, onTextExtracted, handleImageSelection])

  const handleMouseLeave = useCallback((): void => {
    if (selectionState.isSelecting) {
      setSelectionState({
        isSelecting: false,
        selectionRect: null,
        startPoint: null,
        selectionType: null
      })
    }

    if (viewMode.isPanning) {
      setViewMode((prev) => ({
        ...prev,
        isPanning: false,
        panStart: null
      }))

      if (canvasRef.current) {
        canvasRef.current.style.cursor = viewMode.mode === 'select' ? 'crosshair' : 'grab'
      }
    }
  }, [selectionState.isSelecting, viewMode])

  // Navigation functions
  const goToPrevPage = useCallback((): void => {
    if (viewState.pageNum <= 1) return
    setViewState((prev) => ({ ...prev, pageNum: prev.pageNum - 1 }))
  }, [viewState.pageNum])

  const goToNextPage = useCallback((): void => {
    if (viewState.pageNum >= viewState.numPages) return
    setViewState((prev) => ({ ...prev, pageNum: prev.pageNum + 1 }))
  }, [viewState.pageNum, viewState.numPages])

  // Zoom functions
  const zoomIn = useCallback((): void => {
    setViewState((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3.0) }))
  }, [])

  const zoomOut = useCallback((): void => {
    setViewState((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))
  }, [])

  // Toggle functions
  const toggleViewMode = useCallback((): void => {
    setViewMode((prev) => ({
      ...prev,
      mode: prev.mode === 'select' ? 'pan' : 'select'
    }))
  }, [])

  const toggleFullscreen = useCallback((): void => {
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
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      pdfService.cancelRender()
    }
  }, [])

  return {
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
  }
}
