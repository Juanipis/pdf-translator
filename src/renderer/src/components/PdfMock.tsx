import React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { Box, Text } from '@radix-ui/themes'
import { useTranslation } from 'react-i18next'

export function PdfMock(): React.ReactElement {
  const { t } = useTranslation()
  return (
    <ScrollAreaPrimitive.Root className="w-full h-full rounded-md border border-gray-300 bg-white">
      <ScrollAreaPrimitive.Viewport
        style={{ backgroundColor: 'var(--gray-2)', padding: '10px' }}
        className="w-full h-full"
      >
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none text-gray-700">
            {t('pdfMock.title')}
          </h4>
          <Box style={{ height: '800px' }}>
            {/* Placeholder for PDF pages mock */}
            <Text as="div" align="center" color="gray" mb="2">
              PDF Content Mock - Scrollable Area
            </Text>
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                style={{
                  height: '160px',
                  margin: '8px 0',
                  backgroundColor: 'var(--gray-4)',
                  borderRadius: 'var(--radius-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text>Page Mock {i + 1}</Text>
              </Box>
            ))}
          </Box>
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation="vertical">
        <ScrollAreaPrimitive.Thumb />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Scrollbar orientation="horizontal">
        <ScrollAreaPrimitive.Thumb />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
