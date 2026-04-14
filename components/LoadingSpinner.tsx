
import React from 'react';
import { useTranslation } from '../i18n';

export const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gold/5 blur-[100px] rounded-full"></div>
      
      {/* Central Ritual Circle */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-spin-slow"></div>
        <div className="absolute inset-2 rounded-full border-[1px] border-dashed border-gold/40 animate-spin-reverse-slow"></div>
        
        {/* The Seal */}
        <div className="absolute inset-4 rounded-full bg-red-600/20 flex items-center justify-center border-2 border-red-600/40 animate-spirit-pulse shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          <span className="text-4xl text-red-600 font-brush">印</span>
        </div>
      </div>

      <div className="space-y-3 text-center relative z-10">
        <h4 className="text-2xl font-display font-black text-white tracking-widest uppercase italic">
          {t('loading.title')}
        </h4>
        <div className="h-[1px] w-12 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent"></div>
        <p className="text-gold/60 text-sm font-medium tracking-widest uppercase italic">
          {t('loading.subtitle')}
        </p>
      </div>
      
      {/* Floating Kanji elements (decorative) */}
      <div className="absolute top-10 left-1/4 opacity-10 text-gold text-2xl font-brush animate-bounce-slow">魂</div>
      <div className="absolute bottom-10 right-1/4 opacity-10 text-gold text-2xl font-brush animate-bounce-slow" style={{ animationDelay: '1s' }}>命</div>
    </div>
  );
};
