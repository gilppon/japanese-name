import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SpiritFeed } from './components/SpiritFeed';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { generateNames } from './services/geminiService';
import { Style, NameCandidate, FontType, UserProfile } from './types';
import { LanguageProvider, useTranslation } from './i18n';

function AppContent() {
  const { t, locale } = useTranslation();
  const [candidates, setCandidates] = useState<NameCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontType>(FontType.Brush);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedCandidates = localStorage.getItem('candidates');
    const savedProfile = localStorage.getItem('userProfile');
    if (savedCandidates) {
      try {
        setCandidates(JSON.parse(savedCandidates));
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
        
        // If returning from successful payment, scroll to results
        const query = new URLSearchParams(window.location.search);
        if (query.get('success') === 'true') {
          setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (e) {
        console.error('Failed to parse saved candidates', e);
      }
    }
  }, []);

  const handleGenerate = async (profile: UserProfile, style: Style, font: FontType) => {
    setIsLoading(true);
    setCandidates([]); // Clear old results to avoid "James Bond" persistence
    setError(null);
    setSelectedFont(font);
    setUserProfile(profile);
    try {
      const results = await generateNames(profile.name, style, locale);
      setCandidates(results);
      localStorage.setItem('candidates', JSON.stringify(results));
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Failed to generate names. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#04151f] text-[#f5e6be] selection:bg-[#d4af37]/30 pb-0 overflow-x-hidden">
      {/* Texture Overlay */}
      <div className="fixed inset-0 washi-pattern pointer-events-none z-[100]"></div>

      <Header />
      <SpiritFeed />

      <main className="relative">
        {/* 1. Hero Illustration Section - The "Discovery" Banner */}
        <section className="relative w-full h-[50vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <img 
            src="/assets/hero.png" 
            alt="Japanese Heritage"
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-[20s] ease-linear"
          />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#04151f] to-transparent"></div>
          
          <div className="relative z-10 text-center space-y-4 px-4">
            <h2 className="text-xl md:text-3xl font-display text-gold italic tracking-widest animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
              {t('hero.title')}
            </h2>
            <div className="h-[1px] w-24 mx-auto bg-gold/50"></div>
          </div>
        </section>

        {/* 2. Action Section - The "Input" */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
          <section className="bg-[#0a1f2c]/80 backdrop-blur-3xl border border-[#d4af37]/20 rounded-[3rem] p-8 md:p-14 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute inset-0 washi-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            <div className="relative space-y-12">
              <div className="text-center space-y-4">
                <h3 className="text-4xl md:text-5xl font-display font-black text-white">
                  {t('form.sectionHeading')} <span className="text-gold">{t('form.sectionTitle')}</span>
                </h3>
                <p className="text-gold/60 text-lg font-medium max-w-lg mx-auto italic">
                  {t('form.sectionDesc')}
                </p>
              </div>
              
              <div className="pt-2">
                <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
              </div>
            </div>
          </section>

          {/* 3. The Process - Transparency Steps */}
          <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 py-8 px-4">
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors">
                <span className="text-gold font-display font-black">01</span>
              </div>
              <div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest">{t('payment.itemStamp')}</h4>
                <p className="text-gold/40 text-[10px] mt-1 italic">Identify the Kanji that resonates with your spirit's architecture.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors relative">
                <span className="text-gold font-display font-black">02</span>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden md:block opacity-20">→</div>
              </div>
              <div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest">{t('payment.itemLore')}</h4>
                <p className="text-gold/40 text-[10px] mt-1 italic">Artisanal generation of your clan narrative and hanko seal.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors">
                <span className="text-gold font-display font-black">03</span>
              </div>
              <div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest">{t('payment.itemCard')}</h4>
                <p className="text-gold/40 text-[10px] mt-1 italic">Preserve your heritage with high-resolution digital artifacts.</p>
              </div>
            </div>
          </section>

          {/* Premium Kamon Upsell Banner */}
          <section className="mt-4 mb-20 px-2 sm:px-4 relative z-20">
            <div className="bg-gold/5 border border-gold/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:bg-gold/10 transition-colors duration-500">
              <div className="absolute inset-0 washi-pattern opacity-10 pointer-events-none"></div>
              
              {/* Decorative Kamon Background Icon */}
              <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[300px] text-white">filter_vintage</span>
              </div>

              <div className="md:w-1/2 flex flex-col justify-center relative z-10 text-center md:text-left space-y-3">
                <h4 className="text-xl md:text-2xl font-black text-white tracking-wide">
                  {t('payment.kamonPromoTitle')}
                </h4>
                <p className="text-[#f5e6be]/70 text-sm italic pr-0 md:pr-8 leading-relaxed">
                  {t('payment.kamonPromoSub')}
                </p>
              </div>

              <div className="md:w-1/2 relative z-10 w-full pl-0 md:pl-10 md:border-l border-gold/20">
                <ul className="space-y-4">
                  <li className="flex items-center gap-4 text-white/90 hover:text-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-black/40 border border-gold/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gold text-[16px]">account_circle</span>
                    </div>
                    <span className="text-sm font-bold tracking-wider">{t('payment.kamonPromoUse1')}</span>
                  </li>
                  <li className="flex items-center gap-4 text-white/90 hover:text-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-black/40 border border-gold/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gold text-[16px]">brush</span>
                    </div>
                    <span className="text-sm font-bold tracking-wider">{t('payment.kamonPromoUse2')}</span>
                  </li>
                  <li className="flex items-center gap-4 text-white/90 hover:text-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-black/40 border border-gold/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gold text-[16px]">workspace_premium</span>
                    </div>
                    <span className="text-sm font-bold tracking-wider">{t('payment.kamonPromoUse3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Results Section */}
          <section id="results-section" className="mt-24 transition-all duration-1000 pb-32">
            <ResultsDisplay 
              candidates={candidates} 
              isLoading={isLoading} 
              error={error} 
              selectedFont={selectedFont}
              userProfile={userProfile}
            />
          </section>
        </div>

        {/* 4. Footer Decorative Section - The "Arched Garden" */}
        <section className="relative w-full h-[60vh] flex items-end justify-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#04151f] to-transparent z-10"></div>
          
          <div className="relative w-[120vw] md:w-[80vw] lg:w-[60vw] h-full transform translate-y-20">
            {/* Arched Cutout mask effect */}
            <div className="absolute inset-0 rounded-t-full overflow-hidden border-[12px] border-[#0a1f2c] shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
              <img 
                src="/assets/footer.png" 
                alt="Japanese Garden"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f2c] via-transparent to-[#0a1f2c]/40"></div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="relative py-20 text-center bg-[#04151f] border-t border-gold/10">
        <div className="absolute inset-0 washi-pattern opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 rounded-full border border-gold/10 text-gold/40 text-sm font-bold tracking-[0.5em] uppercase">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;