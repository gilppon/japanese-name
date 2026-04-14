import React, { useRef, useState, useEffect } from 'react';
import { clientGenerateHanko, clientGenerateLore, clientGenerateKamon } from '../services/geminiService';
import { FontType, NameCandidate, UserProfile } from '../types';
import { useTranslation } from '../i18n';
import { PayPalButtons } from "@paypal/react-paypal-js";

declare const html2canvas: any;

interface GrandRevealModalProps {
  candidate: NameCandidate;
  font: FontType;
  userProfile: UserProfile | null;
  onClose: () => void;
}

export const GrandRevealModal: React.FC<GrandRevealModalProps> = ({ candidate, font, userProfile, onClose }) => {
  const { t, locale } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [hankoImage, setHankoImage] = useState<string | null>(null);
  const [loreText, setLoreText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [kamonImage, setKamonImage] = useState<string | null>(null);
  const [isGeneratingKamon, setIsGeneratingKamon] = useState(false);

  useEffect(() => {
    const generateArtifacts = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const fontLabel = font === FontType.Brush ? 'Brush Calligraphy' :
                          font === FontType.Serif ? 'Mincho/Serif' :
                          font === FontType.Handwritten ? 'Handwritten' : 'Minimalist Sans';
                           
        const [imgData, lore] = await Promise.all([
          clientGenerateHanko(candidate.kanji, fontLabel, candidate.meaning),
          userProfile
            ? clientGenerateLore(
                candidate.kanji,
                candidate.meaning,
                userProfile.birthday,
                userProfile.personality as string[],
                userProfile.gender,
                locale
              )
            : Promise.resolve(null),
        ]);
        setHankoImage(imgData);
        setLoreText(lore);
      } catch (e) {
        console.error(e);
        setError("Generation failed. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    };

    generateArtifacts();
  }, [candidate, font, userProfile, locale]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a1f2c', // matching background
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `kanji-name-${candidate.kanji}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4 overflow-y-auto">
      {/* Decorative Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gold/60 hover:text-gold transition-colors p-2 z-[210] flex items-center gap-2 group"
      >
        <span className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      <div className="flex flex-col w-full max-w-lg items-center gap-8 animate-fade-in-up py-10 my-auto">
          {/* Section 1: Pure Stamp (Hanko) for practical use */}
          <div className="w-full flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
            {isGenerating && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center animate-pulse"><span className="text-gold font-black tracking-widest uppercase text-xs">Forging Seal...</span></div>}
            
            <div className="flex flex-col items-center text-center mb-2">
              <span className="text-gold tracking-[0.4em] text-[10px] uppercase font-black mb-1">Practical Use</span>
              <h4 className="text-xl text-white font-bold tracking-tight">Your Official Seal (印)</h4>
            </div>
            
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-40 h-40 bg-white/95 rounded-2xl flex items-center justify-center p-4 shadow-2xl relative border-4 border-red-600/30">
                {hankoImage ? (
                  <img 
                    src={hankoImage} 
                    alt="Hanko Stamp" 
                    className="w-full h-full object-contain filter contrast-125"
                  />
                ) : (
                  <div className="w-full h-full border-4 border-dashed border-red-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-4xl text-red-600/20 font-brush italic">印</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full flex-col text-center space-y-3">
              <p className="text-[11px] text-[#f5e6be]/80 italic max-w-[280px] mx-auto bg-black/20 p-2 rounded-lg border border-gold/10">
                <span className="text-red-500 font-bold tracking-widest pl-1 pr-1">•</span> Transparent Deep Crimson PNG <br/> Ready for stamp shop manufacturing.
              </p>
              <button 
                disabled={!hankoImage}
                onClick={() => {
                  if (!hankoImage) return;
                  const link = document.createElement('a');
                  link.href = hankoImage;
                  link.download = `hanko-${candidate.kanji}.png`;
                  link.click();
                }}
                className={`inline-flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest border px-6 py-3 rounded-full ${
                  hankoImage 
                  ? "text-gold border-gold/30 hover:text-white hover:border-gold hover:bg-gold/10" 
                  : "text-gray-600 border-gray-800 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-sm">download</span>
                {hankoImage ? "Download Stamp Only (PNG)" : "Generating..." }
              </button>
            </div>
          </div>

          <div className="w-full flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
            <span className="text-[10px] text-gold/40 uppercase tracking-[0.5em] font-black">OR</span>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
          </div>

          {/* Section 2: Artistic Heirloom Card */}
          <div className="w-full space-y-6">
            <div className="text-center">
              <span className="text-gold tracking-[0.4em] text-[10px] uppercase font-black mb-1">Collectible Artifact</span>
              <h4 className="text-xl text-white font-bold tracking-tight uppercase">Family Heirloom Card</h4>
            </div>

            <div 
              ref={cardRef} 
              className="w-full relative bg-[#0a1f2c] rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] border border-gold/30 overflow-hidden"
            >
              <div className="absolute inset-0 washi-pattern opacity-10 pointer-events-none"></div>
              
              {hankoImage && (
                <div 
                  className="absolute inset-0 z-0 opacity-30 mix-blend-lighten pointer-events-none"
                  style={{
                    backgroundImage: `url(${hankoImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a1f2c]/40 via-transparent to-[#0a1f2c]/90 pointer-events-none"></div>

              <div className="relative z-10 p-8 flex flex-col items-center min-h-[500px]">
                {/* Header Label */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-[1px] w-12 bg-gold/40"></div>
                  <span className="text-gold tracking-[0.5em] text-[10px] uppercase font-black">Heirloom Edition</span>
                  <div className="h-[1px] w-12 bg-gold/40"></div>
                </div>

                {/* The Name */}
                <div className="text-center mb-8">
                  <p className="text-gold font-black tracking-[0.8em] text-xs uppercase mb-2 ml-[0.8em]">
                    {candidate.hiragana}
                  </p>
                  <h3 className={`text-8xl text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-none ${
                      font === FontType.Brush ? 'font-brush' :
                      font === FontType.Serif ? 'font-serif-jp' :
                      font === FontType.Handwritten ? 'font-hand' :
                      'font-minimal'
                    }`}>
                    {candidate.kanji}
                  </h3>
                </div>

                {/* The Meaning / Traits */}
                <div className="w-full text-center mb-10 px-4">
                  <p className="text-[#f5e6be] text-base font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic">
                    "{candidate.meaning}"
                  </p>
                </div>

                {/* The Lore */}
                <div className="w-full bg-gradient-to-b from-black/40 to-black/60 rounded-2xl p-6 border border-gold/20 flex-grow relative overflow-hidden min-h-[150px]">
                  {isGenerating && !loreText && <div className="absolute inset-0 flex items-center justify-center text-gold/40 text-[10px] tracking-widest animate-pulse uppercase">Chanting Destiny...</div>}
                  {loreText && (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-[1px] w-6 bg-gold/30"></div>
                        <p className="text-[10px] text-gold/60 uppercase tracking-[0.4em] font-black">{t('card.loreTitle')}</p>
                        <div className="h-[1px] w-6 bg-gold/30"></div>
                      </div>
                      <p className="text-[#f5e6be]/90 text-sm leading-[1.8] font-medium whitespace-pre-line text-center">
                        {loreText}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4 w-full">
              {/* Primary Action 1: Digital Heirloom Download (Secondary Aesthetic) */}
              <button 
                disabled={isGenerating}
                onClick={handleDownload} 
                className={`w-full uppercase tracking-[0.3em] text-sm font-black py-4 rounded-full transition-all flex items-center justify-center gap-3 ${
                  isGenerating 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                  : "bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/40"
                }`}
              >
                <span className="material-symbols-outlined">download</span>
                {isGenerating ? "Preparing Artifact..." : t('card.downloadButton')}
              </button>

              {/* Action 2: Premium Kamon Upsell Teaser (Primary Aesthetics & Slot Completion) */}
              {!isGenerating && (
                <div className="w-full relative mt-2 overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-[#0a1f2c]/80 flex flex-col p-6 items-center shadow-[0_10px_40px_rgba(212,175,55,0.15)] group hover:border-[#d4af37]/80 hover:bg-gold/5 transition-all">
                  <div className="absolute inset-0 washi-pattern opacity-10 pointer-events-none"></div>
                  
                  {/* Kamon Slot */}
                  {kamonImage ? (
                    <div className="relative w-full aspect-square max-w-[150px] mx-auto bg-white/95 rounded-2xl border-4 border-gold/40 mb-5 flex p-4 shadow-2xl group-hover:scale-105 transition-transform">
                      <div className="absolute inset-0 washi-pattern opacity-30 pointer-events-none"></div>
                      <img src={kamonImage} alt="Kamon Crest" className="w-full h-full object-contain filter contrast-125 relative z-10" />
                    </div>
                  ) : (
                    <div className="relative w-full h-[80px] bg-black/40 rounded-xl border border-dashed border-gold/30 mb-5 flex flex-col items-center justify-center overflow-hidden">
                      {isGeneratingKamon ? (
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-gold animate-spin mb-1 z-10 text-[20px]">hourglass_empty</span>
                          <span className="text-gold tracking-[0.3em] text-xs uppercase font-black z-10 drop-shadow-md animate-pulse">
                            Forging Crest...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none blur-sm scale-150">
                            <span className="material-symbols-outlined text-[120px] text-white">filter_vintage</span>
                          </div>
                          <span className="material-symbols-outlined text-gold/40 mb-1 z-10 text-[20px]">lock</span>
                          <span className="text-gold tracking-[0.3em] text-xs uppercase font-black z-10 drop-shadow-md">
                            [ ????? ]
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="text-center z-10 space-y-2 mb-5">
                    {kamonImage ? (
                      <h5 className="text-gold font-black tracking-[0.3em] uppercase text-sm">
                        Your Family Crest
                      </h5>
                    ) : (
                      <>
                        <h5 className="text-white font-bold tracking-widest uppercase text-sm">
                          {t('card.kamonUpsellTitle')}
                        </h5>
                        <p className="text-[13px] text-[#f5e6be]/80 italic leading-relaxed px-2">
                          {t('card.kamonUpsellDesc')}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="w-full relative z-10 px-2 mt-2">
                    {kamonImage ? (
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = kamonImage;
                          link.download = `kamon-${candidate.kanji}.png`;
                          link.click();
                        }}
                        className="w-full relative z-10 bg-gradient-to-r from-[#d4af37] via-[#f5d179] to-[#d4af37] text-[#0a1f2c] uppercase tracking-[0.1em] text-sm font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download Kamon (PNG)
                      </button>
                    ) : (
                      <>
                        {!isGeneratingKamon && (
                          <PayPalButtons 
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                intent: 'CAPTURE',
                                purchase_units: [{ amount: { value: "3.99", currency_code: "USD" } }]
                              });
                            }}
                            onApprove={async (data, actions) => {
                              if(actions.order) {
                                await actions.order.capture();
                                try {
                                  setIsGeneratingKamon(true);
                                  const kamonUrl = await clientGenerateKamon(candidate.meaning);
                                  setKamonImage(kamonUrl);
                                } catch (err) {
                                  console.error(err);
                                  alert("Kamon generation failed, but your payment was successful. Please contact support.");
                                  setIsGeneratingKamon(false);
                                }
                              }
                            }}
                            style={{ layout: "horizontal", height: 48, color: "gold", tagline: false, shape: "pill" }}
                          />
                        )}
                        <p className="text-center text-[10px] text-white/40 mt-3 font-medium uppercase tracking-widest">
                          <span className="material-symbols-outlined text-[10px] align-middle mr-1">lock</span>
                          Secured by PayPal
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
