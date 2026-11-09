import { OcrModel, OcrResult } from './ocr_model'

export class MockOcrProvider implements OcrModel {
  async processImage(
    _imageData: string | Blob | File,
    options?: {
      language?: string
      detectLanguage?: boolean
      returnBoundingBoxes?: boolean
      result?: string // Add custom result parameter for testing
    }
  ): Promise<OcrResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock data
    return {
      text:
        options?.result ||
        'This is mock OCR text extracted from the image. The OCR service is currently in mock mode.',
      confidence: 0.95,
      language: options?.language || 'en',
      // Only include bounding boxes if explicitly requested and model supports it
      boundingBoxes:
        options?.returnBoundingBoxes === true
          ? [
              {
                x: 10,
                y: 10,
                width: 100,
                height: 20,
                text: 'This is'
              },
              {
                x: 10,
                y: 40,
                width: 200,
                height: 20,
                text: 'mock OCR text extracted'
              }
            ]
          : undefined
    }
  }

  getProviderName(): string {
    return 'mock'
  }

  async isReady(): Promise<boolean> {
    return true // Mock is always ready
  }
}
