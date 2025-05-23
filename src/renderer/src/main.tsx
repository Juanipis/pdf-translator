import './index.css'
import './assets/main.css'
import '@radix-ui/themes/styles.css' // Import Radix Themes styles

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { Theme } from '@radix-ui/themes' // Import Theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {/* Wrap App with Radix Theme */}
      <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
        <App />
      </Theme>
    </ThemeProvider>
  </StrictMode>
)
