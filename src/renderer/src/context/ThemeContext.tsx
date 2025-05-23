import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme } from '@radix-ui/themes'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }): React.ReactElement {
  // Check for system preference or stored preference
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme
    }

    // Default to system preference if available
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  }

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme)

  const toggleTheme = (): void => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newMode)
      return newMode
    })
  }

  // Update theme when system preference changes
  useEffect((): (() => void) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent): void => {
      if (!localStorage.getItem('theme')) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <Theme accentColor="blue" grayColor="sand" radius="medium" appearance={mode}>
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
