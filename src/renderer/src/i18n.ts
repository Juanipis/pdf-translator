import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './i18n/en.json'
import esTranslation from './i18n/es.json'

// Import additional language files as needed
// import frTranslation from './i18n/fr.json'
// import deTranslation from './i18n/de.json'
// import zhTranslation from './i18n/zh.json'

const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  }
  // Add other languages as they become available
  // fr: { translation: frTranslation },
  // de: { translation: deTranslation },
  // zh: { translation: zhTranslation },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
