import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ua from './ua.json'
import en from './en.json'

void i18n.use(initReactI18next).init({
  resources: {
    ua: { translation: ua },
    en: { translation: en },
  },
  lng: 'ua',
  fallbackLng: 'en',
  interpolation: {
    // React already escapes values
    escapeValue: false,
  },
})

export default i18n
