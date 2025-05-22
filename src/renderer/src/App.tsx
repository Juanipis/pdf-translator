import './i18n'
import { Layout } from './components/Layout'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function App(): React.JSX.Element {
  const { i18n } = useTranslation()

  // Set initial language based on browser/system preference
  useEffect(() => {
    const savedLang = localStorage.getItem('language')
    if (savedLang) {
      i18n.changeLanguage(savedLang)
    } else {
      const browserLang = navigator.language.split('-')[0]
      const supportedLang = ['en', 'es', 'fr', 'de', 'zh'].includes(browserLang)
        ? browserLang
        : 'en'
      i18n.changeLanguage(supportedLang)
    }
  }, [i18n])

  return <Layout />
}

export default App
