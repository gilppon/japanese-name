import React from 'react';
import { FontType, NameCandidate, UserProfile } from '../types';
import { useTranslation } from '../i18n';

interface NameCardProps {
  candidate: NameCandidate;
  index: number;
  font: FontType;
  userProfile: UserProfile | null;
  onSelect: (candidate: NameCandidate) => void;
}

export const NameCard: React.FC<NameCardProps> = ({ candidate, font, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div 
      onClick={() => onSelect(candidate)}
      className="relative bg-[#0a1f2c] rounded-3xl shadow-2xl border border-gold/10 overflow-hidden min-h-[320px] flex flex-col group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)] cursor-pointer"
    >
      <div className="absolute inset-0 washi-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
      
      <div className="p-6 flex-grow flex flex-col relative overflow-hidden bg-[#0a1f2c]">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a1f2c]/60 via-transparent to-[#0a1f2c]/90 pointer-events-none"></div>

        <div className="text-center relative z-10 flex flex-col items-center justify-center h-full py-6">
          {/* Main Card Content */}
          <div className="flex flex-col items-center gap-4 w-full bg-black/40 backdrop-blur-[12px] p-8 rounded-[2rem] border border-gold/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative transition-all duration-500 group-hover:border-gold/40">
            <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
            
            <p className="text-gold font-black tracking-[0.6em] text-xs uppercase mt-2">{candidate.hiragana}</p>
            
            <h3 className={`text-7xl text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-tight my-4 ${
              font === FontType.Brush ? 'font-brush' :
              font === FontType.Serif ? 'font-serif-jp' :
              font === FontType.Handwritten ? 'font-hand' :
              font === FontType.ClassicSerif ? 'font-classic' :
              font === FontType.Pen ? 'font-pen' :
              font === FontType.Pop ? 'font-pop' :
              font === FontType.Rounded ? 'font-rounded' :
              'font-minimal'
            }`}>
              {candidate.kanji}
            </h3>

            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-gold/50 to-transparent my-2"></div>

            <div className="w-full px-2">
              <p className="text-[#f5e6be] text-sm font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic origin-center text-center">
                "{candidate.meaning}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Free Action Footer */}
      <div className="bg-[#04151f] p-5 border-t border-gold/20 relative z-20 rounded-b-3xl">
         <button 
           className="w-full bg-gradient-to-r from-[#d4af37] via-[#f5d179] to-[#d4af37] text-[#0a1f2c] uppercase tracking-[0.2em] text-sm font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(212,175,55,0.3)]"
         >
           <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
           {t('card.revealCta')}
         </button>
         <p className="text-center text-[10px] text-gold/40 mt-2 uppercase tracking-widest font-medium">{t('card.revealFree')}</p>
      </div>
    </div>
  );
};