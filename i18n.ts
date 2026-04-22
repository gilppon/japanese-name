import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './locales/en';
import { ko } from './locales/ko';
import { ja } from './locales/ja';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { de } from './locales/de';

export type Locale = 'en' | 'ko' | 'ja' | 'fr' | 'es' | 'pt' | 'de';

export const translations: Record<Locale, typeof en> = { en, ko, ja, fr, es, pt, de };

// Detect browser language → map to supported locale
function detectLocale(): Locale {
  const browserLang = navigator.language?.toLowerCase() || 'en';
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('de')) return 'de';
  return 'en';
}

interface LanguageContextType {
  locale: Locale;
  nativeLocale: string;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  nativeLocale: 'en-US',
  setLocale: () => {},
  t: (key: string) => key,
});

export const useTranslation = () => useContext(LanguageContext);

// Nested key access: t('header.subtitle') → translations.en.header.subtitle
function getNestedValue(obj: any, path: string): string {
  const result = path.split('.').reduce((acc, part) => acc?.[part], obj);
  return typeof result === 'string' ? result : path;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('kanjigen-locale') as Locale | null;
    return saved || detectLocale();
  });

  const nativeLocale = {
    ko: 'ko-KR',
    ja: 'ja-JP',
    fr: 'fr-FR',
    es: 'es-ES',
    pt: 'pt-BR',
    de: 'de-DE',
    en: 'en-US'
  }[locale] || 'en-US';

  useEffect(() => {
    localStorage.setItem('kanjigen-locale', locale);
    document.documentElement.lang = locale;
    
    // Update SEO Meta Tags
    const s = translations[locale].seo;
    document.title = s.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', s.description);
  }, [locale]);

  const t = (key: string): string => {
    return getNestedValue(translations[locale], key);
  };

  return React.createElement(LanguageContext.Provider, { value: { locale, nativeLocale, setLocale, t } }, children);
};
