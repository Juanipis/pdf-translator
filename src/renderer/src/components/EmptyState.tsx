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
      gap="3" // Added gap for spacing between elements
      p="6"
      className={className}
      style={{
        textAlign: 'center',
        height: '100%',
        // Subtle fade-in animation
        animation: 'fadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        color: 'var(--gray-11)' // Slightly lighter text color for better contrast on subtle backgrounds
      }}
    >
      <Box
        mb="3" // Adjusted margin
        style={{
          color: 'var(--accent-9)', // Use accent color for the icon
          backgroundColor: 'var(--accent-a3)', // Use accent alpha for background
          borderRadius: 'var(--radius-full)', // Fully rounded for a softer look
          padding: '20px', // Increased padding for a larger icon area
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 4px var(--accent-a2)' // Subtle outer ring
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(
              icon as React.ReactElement<{ size?: number; strokeWidth?: number }>,
              {
                ...(icon.props && typeof icon.props === 'object' && 'size' in icon.props
                  ? { size: (icon.props as { size?: number }).size || 48 }
                  : { size: 48 }),
                ...(icon.props && typeof icon.props === 'object' && 'strokeWidth' in icon.props
                  ? { strokeWidth: (icon.props as { strokeWidth?: number }).strokeWidth || 1.5 }
                  : { strokeWidth: 1.5 })
              }
            )
          : icon}
      </Box>
      <Heading as="h3" size="5" weight="medium" mb="1" color="gray">
        {' '}
        {/* Adjusted size, weight and color */}
        {title}
      </Heading>
      {description && (
        <Text
          as="p"
          size="3" // Slightly larger text for description
          color="gray"
          mb={actionLabel ? '3' : '0'} // Adjusted margin
          style={{ maxWidth: '350px', lineHeight: '1.6' }} // Increased line height
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button size="2" mt="2" onClick={onAction} variant="soft" color="blue">
          {' '}
          {/* Soft blue variant */}
          {actionLabel}
        </Button>
      )}
      {/* Keyframes for fadeIn animation */}
      <style>
        {`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Flex>
  )
}
