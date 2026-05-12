import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import lt from './locales/lt.json';
import ru from './locales/ru.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'lt', label: 'Lietuvių', short: 'LT' },
  { code: 'ru', label: 'Русский', short: 'RU' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      lt: { translation: lt },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'luxurio_lang',
    },
  });

export default i18n;
