import React, { useState } from 'react';
import type { NameCandidate, FontType, UserProfile } from '../types';
import { NameCard } from './NameCard';
import { LoadingSpinner } from './LoadingSpinner';
import { GrandRevealModal } from './GrandRevealModal';
import { useTranslation } from '../i18n';

interface ResultsDisplayProps {
  candidates: NameCandidate[];
  isLoading: boolean;
  error: string | null;
  selectedFont: FontType;
  userProfile: UserProfile | null;
}

const InitialState: React.FC = () => {
    const { t } = useTranslation();
    return (
    <div className="relative text-center py-24 px-8 bg-[#0a1f2c]/40 backdrop-blur-2xl rounded-[3rem] border-2 border-gold/20 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 washi-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
        
        <div className="relative space-y-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-2 border-gold/40 flex items-center justify-center relative">
            <div className="absolute inset-0 border border-gold/20 rounded-full animate-ping opacity-20"></div>
            <span className="font-brush text-5xl text-gold">{t('results.emptyKanji')}</span>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-display font-medium text-white tracking-widest uppercase">
              {t('results.emptyTitle')} <span className="text-gold">{t('results.emptyTitleAccent')}</span>
            </h3>
            <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
            <p className="text-gold/50 text-base font-medium max-w-md mx-auto italic leading-relaxed">
              {t('results.emptyDesc')} <br/>
              {t('results.emptySubDesc')}
            </p>
          </div>
          
          <div className="pt-4">
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold/20"></div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ candidates, isLoading, error, selectedFont, userProfile }) => {
  const { t } = useTranslation();
  const [selectedCandidate, setSelectedCandidate] = useState<NameCandidate | null>(null);

  if (isLoading) {
    return <div className="py-20"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-100 rounded-3xl">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return <InitialState />;
  }

  return (
    <div className="space-y-12 relative">
        <div className="flex flex-col items-center justify-center gap-6 text-center border-b border-gold/10 pb-12">
          <div className="space-y-2">
            <span className="bg-gold/10 text-gold px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.4em] border border-gold/20">
              {candidates.length} {t('results.countLabel')}
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight mt-4">
              {t('results.heading')} <span className="text-gold">{t('results.headingAccent')}</span>
            </h2>
          </div>

          {/* Free Tier Info Banner */}
          <div className="max-w-2xl w-full bg-emerald-900/20 backdrop-blur-md rounded-[2rem] border border-emerald-500/30 p-6 flex flex-col items-center gap-3 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <h3 className="text-lg text-white font-bold uppercase tracking-widest">{t('results.freeResultTitle')}</h3>
            </div>
            <p className="text-[12px] text-emerald-200/70 text-center leading-relaxed max-w-md">{t('results.freeResultDesc')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {candidates.map((candidate, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <NameCard 
                    candidate={candidate} 
                    index={index} 
                    font={selectedFont} 
                    userProfile={userProfile} 
                    onSelect={setSelectedCandidate}
                  />
                </div>
            ))}
        </div>

        {selectedCandidate && (
          <GrandRevealModal 
             candidate={selectedCandidate}
             font={selectedFont}
             userProfile={userProfile}
             onClose={() => setSelectedCandidate(null)}
          />
        )}
    </div>
  );
};
