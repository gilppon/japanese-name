import React, { useEffect } from 'react';
import { Header } from '../Header';

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#04151f] text-[#f5e6be] selection:bg-[#d4af37]/30 pb-20">
      {/* Texture Overlay */}
      <div className="fixed inset-0 washi-pattern pointer-events-none z-[100]"></div>

      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        <button 
          onClick={() => { window.location.hash = '#/'; }}
          className="flex items-center gap-2 text-gold/60 hover:text-gold transition-colors mb-8 text-sm font-bold tracking-wider uppercase"
        >
          ← Back to Main
        </button>

        <section className="bg-[#0a1f2c]/80 backdrop-blur-3xl border border-[#d4af37]/20 rounded-[3rem] p-8 md:p-14 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute inset-0 washi-pattern opacity-10"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-10 pb-6 border-b border-gold/20">
              {title}
            </h1>
            
            <div className="space-y-8 text-white/80 leading-relaxed text-sm md:text-base">
              {children}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
