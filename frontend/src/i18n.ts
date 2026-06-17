import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  de: { translation: de },
  es: { translation: es },
  fr: { translation: fr }
};

const savedLanguage = localStorage.getItem('sankalp_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already protects from xss
    }
  });

export default i18n;
