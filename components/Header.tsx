import React from 'react';
import { useTranslation } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="relative py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 washi-pattern opacity-20"></div>
      
      {/* Language Switcher — top right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-8">
          <div className="relative group">
            {/* Multi-layered Ornate Circles */}
            <div className="absolute -inset-8 border border-gold/5 rounded-full scale-150 group-hover:scale-[1.6] transition-transform duration-1000"></div>
            <div className="absolute -inset-6 border border-gold/10 rounded-full scale-125 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute -inset-4 border-2 border-gold/20 rounded-full"></div>
            <div className="absolute -inset-2 border border-gold/40 rounded-full group-hover:rotate-180 transition-transform duration-[4s] ease-linear"></div>
            
            <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center text-gray-900 font-brush text-5xl shadow-[0_0_60px_rgba(212,175,55,0.3)] relative z-10 transition-all duration-700 group-hover:shadow-[0_0_100px_rgba(212,175,55,0.5)]">
               <div className="absolute inset-1 border-[3px] border-black/10 rounded-full"></div>
               名
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-[0.3em] uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              Kanji<span className="text-gold">Gen</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold/30"></div>
                <p className="text-gold text-[10px] md:text-xs font-black tracking-[0.5em] uppercase opacity-80 whitespace-nowrap">
                  {t('header.subtitle')}
                </p>
                <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold/30"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};