import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './locales/en';
import { ko } from './locales/ko';

export type Locale = 'en' | 'ko';

export const translations: Record<Locale, typeof en> = { en, ko };

// Detect browser language → map to supported locale
function detectLocale(): Locale {
  const browserLang = navigator.language?.toLowerCase() || 'en';
  if (browserLang.startsWith('ko')) return 'ko';
  return 'en';
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
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

  return React.createElement(LanguageContext.Provider, { value: { locale, setLocale, t } }, children);
};
