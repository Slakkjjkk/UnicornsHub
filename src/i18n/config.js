import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

const savedLanguage = window.localStorage.getItem('unicorns-hub-language');
const browserLanguage = navigator.language?.slice(0, 2);
const initialLanguage = savedLanguage || (['pt', 'en', 'es'].includes(browserLanguage) ? browserLanguage : 'pt');

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
