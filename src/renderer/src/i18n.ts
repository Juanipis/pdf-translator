import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      welcome: 'Build an Electron app with <1>React</1> and <3>TypeScript</3>',
      powered: 'Powered by electron-vite',
      tip: 'Please try pressing <1>F12</1> to open the devTool',
      documentation: 'Documentation',
      sendIpc: 'Send IPC'
    }
  },
  es: {
    translation: {
      welcome: 'Crea una app Electron con <1>React</1> y <3>TypeScript</3>',
      powered: 'Desarrollado por electron-vite',
      tip: 'Presiona <1>F12</1> para abrir las herramientas de desarrollo',
      documentation: 'Documentación',
      sendIpc: 'Enviar IPC'
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
