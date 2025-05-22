export interface OcrResult {
  text: string
  confidence?: number
  language?: string
  boundingBoxes?: {
    x: number
    y: number
    width: number
    height: number
    text: string
  }[]
}

export interface OcrModel {
  /**
   * Process image data and extract text
   * @param imageData - Base64 encoded image or Blob or File
   * @param options - Additional options for OCR processing
   * @returns Promise with OCR result
   */
  processImage(
    imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
      result?: string // Custom result for testing purposes
    }
  ): Promise<OcrResult>

  /**
   * Get the provider name
   */
  getProviderName(): string

  /**
   * Check if the model is ready to use (e.g., has valid API keys)
   */
  isReady(): Promise<boolean>
}
