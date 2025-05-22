import * as pdfjsLib from 'pdfjs-dist'

// Configure worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

export interface PdfTextItem {
  str: string
  transform: number[]
  width: number
  height: number
}

export interface PdfSelection {
  x: number
  y: number
  width: number
  height: number
}

export interface PdfPoint {
  x: number
  y: number
}

export class PdfService {
  private renderTaskRef: pdfjsLib.RenderTask | null = null

  async loadDocument(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const typedArray = new Uint8Array(e.target.result as ArrayBuffer)
            const loadingTask = pdfjsLib.getDocument({ data: typedArray })
            const pdf = await loadingTask.promise
            resolve(pdf)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('File reading failed'))
      reader.readAsArrayBuffer(file)
    })
  }

  async renderPage(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number
  ): Promise<void> {
    // Cancel any ongoing render task
    if (this.renderTaskRef) {
      this.renderTaskRef.cancel()
      this.renderTaskRef = null
    }

    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Canvas context not available')
    }

    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    const renderTask = page.render(renderContext)
    this.renderTaskRef = renderTask
    
    try {
      await renderTask.promise
    } catch (error) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        throw error
      }
    } finally {
      this.renderTaskRef = null
    }
  }

  async convertCanvasToPageCoordinates(
    canvasPoint: PdfPoint,
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    scale: number,
    containerScrollLeft = 0,
    containerScrollTop = 0
  ): Promise<PdfPoint> {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1 })
    
    // Adjust for scroll position and scale
    const adjustedX = (canvasPoint.x + containerScrollLeft) / scale
    const adjustedY = (canvasPoint.y + containerScrollTop) / scale
    
    // Convert to PDF coordinates
    const pdfPoint = viewport.convertToPdfPoint(adjustedX, adjustedY)
    return { x: pdfPoint[0], y: pdfPoint[1] }
  }

  async extractTextFromSelection(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    selection: PdfSelection,
    scale: number,
    containerScrollLeft = 0,
    containerScrollTop = 0
  ): Promise<string> {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1 })

    // Adjust selection for scroll position
    const adjustedSelection = {
      x: selection.x + containerScrollLeft,
      y: selection.y + containerScrollTop,
      width: selection.width,
      height: selection.height
    }

    // Convert selection bounds to PDF coordinates
    const pdfPointTopLeft = viewport.convertToPdfPoint(
      adjustedSelection.x / scale,
      adjustedSelection.y / scale
    )
    const pdfPointBottomRight = viewport.convertToPdfPoint(
      (adjustedSelection.x + adjustedSelection.width) / scale,
      (adjustedSelection.y + adjustedSelection.height) / scale
    )

    const pdfRect = [
      Math.min(pdfPointTopLeft[0], pdfPointBottomRight[0]),
      Math.min(pdfPointTopLeft[1], pdfPointBottomRight[1]),
      Math.max(pdfPointTopLeft[0], pdfPointBottomRight[0]),
      Math.max(pdfPointTopLeft[1], pdfPointBottomRight[1])
    ]

    const textContent = await page.getTextContent({
      includeMarkedContent: true,
      disableNormalization: false
    })

    let extractedText = ''

    for (const item of textContent.items) {
      if ('str' in item && item.str && item.transform && Array.isArray(item.transform) && item.transform.length >= 6) {
        const tx = item.transform
        const itemX = tx[4]
        const itemY = tx[5]
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

        // Check intersection
        if (
          itemRect.x1 < selectionPdfRect.x2 &&
          itemRect.x2 > selectionPdfRect.x1 &&
          itemRect.y1 < selectionPdfRect.y2 &&
          itemRect.y2 > selectionPdfRect.y1
        ) {
          extractedText += item.str + ' '
        }
      }
    }

    return extractedText.trim()
  }

  captureImageFromSelection(
    canvas: HTMLCanvasElement,
    selection: PdfSelection
  ): string {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = selection.width
    tempCanvas.height = selection.height
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      throw new Error('Unable to create temporary canvas context')
    }

    // Capture the selection area directly from canvas
    tempCtx.drawImage(
      canvas,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
      0,
      0,
      selection.width,
      selection.height
    )

    return tempCanvas.toDataURL('image/png')
  }

  cancelRender(): void {
    if (this.renderTaskRef) {
      this.renderTaskRef.cancel()
      this.renderTaskRef = null
    }
  }
}

export const pdfService = new PdfService() 