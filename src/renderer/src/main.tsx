import './index.css'
import './assets/main.css'
import '@radix-ui/themes/styles.css' // Import Radix Themes styles

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Theme } from '@radix-ui/themes' // Import Theme provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme accentColor="blue" grayColor="sand" radius="medium" appearance="light">
      <App />
    </Theme>
  </StrictMode>
)
