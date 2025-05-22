import React from 'react'
import { Box, Flex, Text, Heading } from '@radix-ui/themes'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  className?: string // className might not be as effective with Radix Themes props
}

export function EmptyState({
  icon,
  title,
  description,
  className
}: EmptyStateProps): React.ReactElement {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p="6"
      className={className} // Keep for potential overrides, but prefer Radix props
      style={{ textAlign: 'center' }}
    >
      <Box mb="2" style={{ color: 'var(--gray-8)' }}>
        {icon}
      </Box>
      <Heading as="h3" size="4" color="gray" mb="1">
        {title}
      </Heading>
      {description && (
        <Text as="p" size="2" color="gray">
          {description}
        </Text>
      )}
    </Flex>
  )
}
