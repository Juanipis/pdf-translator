import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      welcome: 'Build an Electron app with <1>React</1> and <3>TypeScript</3>',
      powered: 'Powered by electron-vite',
      tip: 'Please try pressing <1>F12</1> to open the devTool',
      documentation: 'Documentation',
      sendIpc: 'Send IPC',
      app: {
        title: "Juanipi's PDF Translator"
      },
      settings: {
        title: 'Settings',
        description: 'Application settings (mock).',
        closeButton: 'Close'
      },
      layout: {
        sourceDocumentTitle: 'Source Document',
        uploadPdfButton: 'Upload PDF',
        noPdfLoadedTitle: 'No PDF Loaded',
        noPdfLoadedDescription: 'Click "Upload PDF" to select a document...',
        translatedContentTitle: 'Translated Content',
        noContentToTranslateTitle: 'No content to translate',
        noContentToTranslateDescription: 'Upload a PDF to see its translation here.'
      }
    }
  },
  es: {
    translation: {
      welcome: 'Crea una app Electron con <1>React</1> y <3>TypeScript</3>',
      powered: 'Desarrollado por electron-vite',
      tip: 'Presiona <1>F12</1> para abrir las herramientas de desarrollo',
      documentation: 'Documentación',
      sendIpc: 'Enviar IPC',
      app: {
        title: 'Traductor de PDF de Juanipi'
      },
      settings: {
        title: 'Configuración',
        description: 'Configuraciones de la app (mock).',
        closeButton: 'Cerrar'
      },
      layout: {
        sourceDocumentTitle: 'Documento Fuente',
        uploadPdfButton: 'Subir PDF',
        noPdfLoadedTitle: 'Ningún PDF Cargado',
        noPdfLoadedDescription: 'Haz clic en "Subir PDF" para seleccionar un documento...',
        translatedContentTitle: 'Contenido Traducido',
        noContentToTranslateTitle: 'Sin contenido para traducir',
        noContentToTranslateDescription: 'Sube un PDF para ver su traducción aquí.'
      }
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
