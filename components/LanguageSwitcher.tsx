import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Locale } from '../i18n';

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'ko', flag: '🇰🇷', label: 'KO' },
];

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-gold/20 rounded-full text-gold/70 hover:text-gold hover:border-gold/40 transition-all text-xs font-bold tracking-wider"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-[#0a1f2c] border border-gold/20 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] min-w-[100px]">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLocale(lang.code); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wider transition-all ${
                locale === lang.code
                  ? 'bg-gold/20 text-gold'
                  : 'text-gold/50 hover:bg-white/5 hover:text-gold'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
