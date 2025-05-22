import React from 'react'
import { Box, Flex, Text, Heading, Button } from '@radix-ui/themes'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps): React.ReactElement {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p="6"
      className={className}
      style={{
        textAlign: 'center',
        height: '100%',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      <Box
        mb="4"
        style={{
          color: 'var(--gray-8)',
          backgroundColor: 'var(--gray-3)',
          borderRadius: '50%',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Heading as="h3" size="4" mb="2" color="gray">
        {title}
      </Heading>
      {description && (
        <Text
          as="p"
          size="2"
          color="gray"
          mb={actionLabel ? '4' : '0'}
          style={{ maxWidth: '300px' }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button size="2" mt="2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Flex>
  )
}
