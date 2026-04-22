import React, { useRef, useState } from 'react';
import { clientGenerateHanko, clientGenerateLore, clientGenerateKamon, clientGenerateKamonExplanation, clientGenerateDeepMeaning } from '../services/geminiService';
import { FontType, NameCandidate, UserProfile } from '../types';
import { useTranslation } from '../i18n';
import { PayPalButtons } from "@paypal/react-paypal-js";

declare const html2canvas: any;
declare const JSZip: any;


interface GrandRevealModalProps {
  candidate: NameCandidate;
  font: FontType;
  userProfile: UserProfile | null;
  onClose: () => void;
}

export const GrandRevealModal: React.FC<GrandRevealModalProps> = ({ candidate, font, userProfile, onClose }) => {
  const { t, locale, nativeLocale } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Heritage ($4.99) state
  const [heritagePaid, setHeritagePaid] = useState(false);
  const [hankoImage, setHankoImage] = useState<string | null>(null);
  const [loreText, setLoreText] = useState<string | null>(null);
  const [isGeneratingHeritage, setIsGeneratingHeritage] = useState(false);
  const [heritageError, setHeritageError] = useState<string | null>(null);
  const [deepMeaningText, setDeepMeaningText] = useState<string | null>(null);
  
  // Order save state
  const [orderSaved, setOrderSaved] = useState(false);
  const [orderSaveMessage, setOrderSaveMessage] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState<string | null>(null);
  const [heritagePaypalOrderId, setHeritagePaypalOrderId] = useState<string | null>(null);

  // Regeneration & Finalization state
  const [regenCount, setRegenCount] = useState(0);
  const MAX_REGEN = 3;
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [hankoFinalized, setHankoFinalized] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeMessage, setFinalizeMessage] = useState<string | null>(null);
  
  // Kamon ($3.99) state
  const [kamonImage, setKamonImage] = useState<string | null>(null);
  const [isGeneratingKamon, setIsGeneratingKamon] = useState(false);
  const [kamonExplanation, setKamonExplanation] = useState<string | null>(null);
  const [isGeneratingKamonExplanation, setIsGeneratingKamonExplanation] = useState(false);

  const handleHeritagePaymentSuccess = async (email?: string, paypalOrderId?: string) => {
    setHeritagePaid(true);
    setIsGeneratingHeritage(true);
    setHeritageError(null);
    if (email) setPayerEmail(email);
    if (paypalOrderId) setHeritagePaypalOrderId(paypalOrderId);
    try {
      const fontLabel = font === FontType.Brush ? 'Brush Calligraphy' :
                        font === FontType.Serif ? 'Mincho/Serif' :
                        font === FontType.Handwritten ? 'Handwritten' : 'Minimalist Sans';
                         
      const [imgData, lore, deepMeaning] = await Promise.all([
        clientGenerateHanko(candidate.kanji, fontLabel, candidate.meaning),
        userProfile
          ? clientGenerateLore(
              candidate.kanji,
              candidate.meaning,
              userProfile.birthday,
              userProfile.personality as string[],
              userProfile.gender,
              nativeLocale
            )
          : Promise.resolve(null),
        clientGenerateDeepMeaning(candidate.kanji, candidate.meaning, nativeLocale)
      ]);
      setHankoImage(imgData);
      setLoreText(lore);
      setDeepMeaningText(deepMeaning);

      // Circuit Breaker: 서버 저장 시도 (이메일은 확정 시 발송 — /finalize-order)
      if (email && paypalOrderId) {
        try {
          const saveResp = await fetch('/api/save-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paypalOrderId,
              email,
              originalName: userProfile?.name || '',
              kanji: candidate.kanji,
              hiragana: candidate.hiragana,
              meaning: candidate.meaning,
              deepMeaning: deepMeaning,
              loreText: lore,
              hankoUrl: imgData,
              amountPaid: 4.99,
              locale: nativeLocale,
              productType: 'heritage'
            })
          });
          const saveData = await saveResp.json();
          if (saveData.success) {
            setOrderSaved(true);
            setSavedOrderId(saveData.orderId);
            setOrderSaveMessage('✅ Heritage saved! Please review your seal and confirm below.');
          } else if (saveData.fallback) {
            setOrderSaveMessage('⚠️ Cloud save unavailable. Please download your files directly.');
          }
        } catch (saveError) {
          console.error('[Circuit Breaker] Order save failed:', saveError);
          setOrderSaveMessage('⚠️ Cloud save unavailable. Please download your files directly.');
        }
      }
    } catch (e) {
      console.error(e);
      setHeritageError("Generation failed. Your payment was successful. Please contact support.");
    } finally {
      setIsGeneratingHeritage(false);
    }
  };

  // Regenerate Hanko (max 3 times)
  const handleRegenerateHanko = async () => {
    if (regenCount >= MAX_REGEN || hankoFinalized) return;
    setIsRegenerating(true);
    setHeritageError(null);
    try {
      const fontLabel = font === FontType.Brush ? 'Brush Calligraphy' :
                        font === FontType.Serif ? 'Mincho/Serif' :
                        font === FontType.Handwritten ? 'Handwritten' : 'Minimalist Sans';
      const imgData = await clientGenerateHanko(candidate.kanji, fontLabel, candidate.meaning);
      setHankoImage(imgData);
      setRegenCount(prev => prev + 1);
    } catch (e) {
      console.error(e);
      setHeritageError('Regeneration failed. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Finalize Hanko & trigger email delivery
  const handleFinalizeHanko = async () => {
    if (hankoFinalized) return;
    setIsFinalizing(true);
    try {
      const resp = await fetch('/api/finalize-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: savedOrderId,
          hankoUrl: hankoImage
        })
      });
      const data = await resp.json();
      setHankoFinalized(true);
      if (data.success) {
        setFinalizeMessage(
          data.emailFailed
            ? '✅ Seal confirmed! (Email delivery will retry later)'
            : `✅ Confirmed! Heritage email sent to ${payerEmail || 'your PayPal email'}.`
        );
      } else {
        setFinalizeMessage('⚠️ Confirmed, but email delivery failed. Please download directly.');
      }
    } catch (err) {
      console.error('[Finalize] Error:', err);
      setHankoFinalized(true);
      setFinalizeMessage('⚠️ Confirmed, but email delivery failed. Please download directly.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGeneratingHeritage(true); // Show loading state during packaging
      
      // 1. Capture the Heirloom Card
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a1f2c',
        scale: 2,
        useCORS: true,
      });
      const cardDataUrl = canvas.toDataURL('image/png');
      const cardBlob = await (await fetch(cardDataUrl)).blob();

      // 2. Prepare ZIP
      const zip = new JSZip();
      const folder = zip.folder(`${candidate.kanji}_Heritage_Artifacts`);
      
      // Add Main Card
      folder.file("Heirloom_Card.png", cardBlob);

      // Add Hanko if available
      if (hankoImage) {
        const hankoBlob = await (await fetch(hankoImage)).blob();
        folder.file("Hanko_Stamp.png", hankoBlob);
      }

      // Add Kamon if available
      if (kamonImage) {
        const kamonBlob = await (await fetch(kamonImage)).blob();
        folder.file("Kamon_Crest.png", kamonBlob);
      }

      // 3. Create Explanation Text
      let explanation = `==========================================\n`;
      explanation += `   HERITAGE ARTIFACT: ${candidate.kanji}\n`;
      explanation += `==========================================\n\n`;
      explanation += `[ Identity ]\n`;
      explanation += `Kanji: ${candidate.kanji}\n`;
      explanation += `Reading: ${candidate.hiragana}\n`;
      explanation += `Meaning: ${candidate.meaning}\n\n`;

      if (deepMeaningText) {
        explanation += `[ Philosophy of the Name ]\n`;
        explanation += `${deepMeaningText}\n\n`;
      }

      if (loreText) {
        explanation += `[ Ancestral Lore ]\n`;
        explanation += `${loreText}\n\n`;
      }

      if (kamonExplanation) {
        explanation += `[ Philosophy of the Symbol (Kamon) ]\n`;
        explanation += `${kamonExplanation}\n\n`;
      }

      explanation += `------------------------------------------\n`;
      explanation += `Generated by KanjiGen AI Studio\n`;
      explanation += `© 2026 Next-Haru Inc. All rights reserved.\n`;

      folder.file("Heritage_Explanation.txt", explanation);

      // 4. Generate & Trigger Download
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${candidate.kanji}_Heritage_Package.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating heritage package:', error);
      alert("Failed to package assets. Please try again.");
    } finally {
      setIsGeneratingHeritage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4 overflow-y-auto">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gold/60 hover:text-gold transition-colors p-2 z-[210] flex items-center gap-2 group"
      >
        <span className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      <div className="flex flex-col w-full max-w-lg items-center gap-8 animate-fade-in-up py-10 my-auto">
        
        {/* ===== SECTION 0: FREE NAME PREVIEW ===== */}
        <div className="w-full flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center mb-2">
            <span className="text-emerald-400 tracking-[0.4em] text-[10px] uppercase font-black mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              {t('card.freePreviewLabel')}
            </span>
            <h4 className="text-xl text-white font-bold tracking-tight">{t('card.yourKanjiName')}</h4>
          </div>

          <div className="text-center">
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

          <div className="w-full text-center px-4 mt-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-gold/60 text-[14px]">auto_awesome</span>
              <p className="text-[10px] text-gold/60 uppercase tracking-[0.4em] font-black">{t('card.meaningTitle')}</p>
            </div>
            <p className="text-[#f5e6be] text-base font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic">
              "{candidate.meaning}"
            </p>
          </div>
        </div>

        {/* ===== DIVIDER ===== */}
        <div className="w-full flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
          <span className="text-[10px] text-gold/40 uppercase tracking-[0.5em] font-black">Upgrade</span>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
        </div>

        {/* ===== SECTION 1: HERITAGE PAYWALL ($4.99) — Hanko + Lore + Card ===== */}
        {!heritagePaid ? (
          <div className="w-full bg-gradient-to-b from-[#0a1f2c] to-[#04151f] rounded-[2.5rem] border border-gold/30 p-6 shadow-[0_10px_40px_rgba(212,175,55,0.15)] relative overflow-hidden group hover:border-gold/50 transition-all">
            <div className="absolute inset-0 washi-pattern opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-5">
              {/* Preview: Locked Areas */}
              <div className="flex items-center gap-4">
                {/* Locked Hanko */}
                <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center border-2 border-dashed border-red-600/30 relative">
                  <span className="text-3xl text-red-600/20 font-brush italic">印</span>
                  <span className="material-symbols-outlined text-gold/60 absolute -bottom-1 -right-1 text-[16px] bg-[#0a1f2c] rounded-full p-0.5 border border-gold/30">lock</span>
                </div>
                {/* Text */}
                <div className="flex-grow">
                  <h5 className="text-white font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-gold animate-pulse text-[16px]">auto_awesome</span>
                    {t('payment.heritageBundle')}
                  </h5>
                  <p className="text-[12px] text-[#f5e6be]/60 mt-1 leading-relaxed">{t('payment.revealDesc')}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gold/5 rounded-xl p-4 border border-gold/10">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[11px] text-[#f5e6be]/80">
                    <span className="material-symbols-outlined text-[12px] text-gold">check_circle</span>
                    {t('payment.itemStamp')}
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-[#f5e6be]/80">
                    <span className="material-symbols-outlined text-[12px] text-gold">check_circle</span>
                    {t('payment.itemLore')}
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-[#f5e6be]/80">
                    <span className="material-symbols-outlined text-[12px] text-gold">check_circle</span>
                    {t('payment.itemCard')}
                  </li>
                </ul>
              </div>

              {/* Price + PayPal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="block text-[10px] text-gold/60 uppercase font-black tracking-tighter">{t('payment.oneTimeFee')}</span>
                    <span className="text-2xl text-white font-black">{t('payment.price')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gold/80 uppercase tracking-widest font-black flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] animate-pulse">auto_awesome</span>
                      {t('payment.revealCta')}
                    </span>
                  </div>
                </div>

                <PayPalButtons 
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [{ amount: { value: "4.99", currency_code: "USD" } }]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if(actions.order) {
                      const details = await actions.order.capture();
                      const email = (details as any)?.payer?.email_address;
                      const orderId = (details as any)?.id;
                      handleHeritagePaymentSuccess(email, orderId);
                    }
                  }}
                  style={{ layout: "horizontal", height: 48, color: "gold", tagline: false, shape: "pill" }}
                />
                <p className="text-center text-[10px] text-white/40 font-medium uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[10px] align-middle mr-1">lock</span>
                  Secured by PayPal
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ===== HERITAGE UNLOCKED: Show Hanko + Lore + Card ===== */
          <div className="w-full space-y-6">
            {/* Hanko Seal */}
            <div className="w-full flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
              {(isGeneratingHeritage || isRegenerating) && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center animate-pulse"><span className="text-gold font-black tracking-widest uppercase text-xs">{isRegenerating ? 'Re-Forging Seal...' : 'Forging Seal...'}</span></div>}
              {heritageError && <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4"><span className="text-red-400 text-sm text-center">{heritageError}</span></div>}
              
              <div className="flex flex-col items-center text-center mb-2">
                <span className="text-gold tracking-[0.4em] text-[10px] uppercase font-black mb-1">Practical Use</span>
                <h4 className="text-xl text-white font-bold tracking-tight">{t('card.yourSealTitle')}</h4>
              </div>
              
              <div className="relative group cursor-pointer">
                <div className={`absolute -inset-4 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${hankoFinalized ? 'bg-emerald-500/20' : 'bg-red-600/20'}`}></div>
                <div className={`w-40 h-40 bg-white/95 rounded-full flex items-center justify-center p-4 shadow-2xl relative border-4 ${hankoFinalized ? 'border-emerald-500/50' : 'border-red-600/30'}`}>
                  {hankoImage ? (
                    <img 
                      src={hankoImage} 
                      alt="Hanko Stamp" 
                      className="w-full h-full object-contain filter contrast-125"
                    />
                  ) : (
                    <div className="w-full h-full border-4 border-dashed border-red-600/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl text-red-600/20 font-brush italic">印</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Regenerate + Finalize Buttons */}
              {hankoImage && !hankoFinalized && (
                <div className="w-full flex flex-col items-center gap-3 mt-2">
                  {/* Regenerate Button */}
                  <button
                    disabled={regenCount >= MAX_REGEN || isRegenerating}
                    onClick={handleRegenerateHanko}
                    className={`w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border px-6 py-3 rounded-full transition-all ${
                      regenCount >= MAX_REGEN
                        ? 'text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
                        : 'text-amber-400 border-amber-400/30 hover:text-white hover:border-amber-400 hover:bg-amber-400/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    {regenCount >= MAX_REGEN
                      ? `Regeneration Limit Reached (${MAX_REGEN}/${MAX_REGEN})`
                      : `Re-forge Seal (${regenCount}/${MAX_REGEN} used)`
                    }
                  </button>

                  {/* Finalize Button */}
                  <button
                    disabled={isFinalizing}
                    onClick={handleFinalizeHanko}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest px-6 py-4 rounded-full transition-all bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {isFinalizing ? 'Confirming...' : 'Confirm This Seal & Send Email'}
                  </button>
                  <p className="text-[10px] text-white/40 text-center">⚠️ Once confirmed, the seal cannot be changed.</p>
                </div>
              )}

              {/* Finalized Badge */}
              {hankoFinalized && (
                <div className="w-full flex flex-col items-center gap-2 mt-2 animate-fade-in">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Seal Confirmed
                  </div>
                  {finalizeMessage && (
                    <p className={`text-[11px] text-center px-4 ${
                      finalizeMessage.includes('⚠️') ? 'text-amber-300' : 'text-emerald-300/80'
                    }`}>
                      {finalizeMessage}
                    </p>
                  )}
                </div>
              )}

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

            {/* Heirloom Card + Lore */}
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
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-[1px] w-12 bg-gold/40"></div>
                    <span className="text-gold tracking-[0.5em] text-[10px] uppercase font-black">Heirloom Edition</span>
                    <div className="h-[1px] w-12 bg-gold/40"></div>
                  </div>

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

                  <div className="w-full text-left mb-10 px-4">
                    <div className="flex items-center justify-center gap-2 mb-3 text-center">
                      <span className="material-symbols-outlined text-gold/60 text-[14px]">auto_awesome</span>
                      <p className="text-[10px] text-gold/60 uppercase tracking-[0.4em] font-black">{t('card.meaningTitle')}</p>
                    </div>
                    
                    {isGeneratingHeritage && !deepMeaningText && <div className="text-center text-gold/40 text-[10px] tracking-widest animate-pulse uppercase my-4">Deciphering Kanji...</div>}
                    
                    {deepMeaningText ? (
                      <div className="bg-black/30 border border-gold/10 rounded-xl p-5 text-left">
                        {deepMeaningText.split('\n').map((line, i) => {
                          const isHeading = line.startsWith('[') || line.startsWith('✨');
                          return (
                            <p key={i} className={`text-[#f5e6be] text-sm leading-relaxed ${isHeading ? 'font-bold mt-4 mb-1 text-gold/90' : 'font-medium opacity-90'}`}>
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[#f5e6be] text-lg text-center font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic">
                        "{candidate.meaning}"
                      </p>
                    )}
                  </div>

                  {/* Lore */}
                  <div className="w-full bg-gradient-to-b from-black/40 to-black/60 rounded-2xl p-6 border border-gold/20 flex-grow relative overflow-hidden min-h-[150px]">
                    {isGeneratingHeritage && !loreText && <div className="absolute inset-0 flex items-center justify-center text-gold/40 text-[10px] tracking-widest animate-pulse uppercase">Chanting Destiny...</div>}
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

              <button 
                disabled={isGeneratingHeritage}
                onClick={handleDownload} 
                className={`w-full uppercase tracking-[0.3em] text-sm font-black py-4 rounded-full transition-all flex items-center justify-center gap-3 ${
                  isGeneratingHeritage 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                  : "bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/40"
                }`}
              >
                <span className="material-symbols-outlined">download</span>
                {isGeneratingHeritage ? "Preparing Artifact..." : t('card.downloadButton')}
              </button>

              {/* Order Save Status Banner */}
              {orderSaveMessage && (
                <div className={`w-full rounded-2xl p-4 border text-center text-sm animate-fade-in ${
                  orderSaved
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}>
                  <p>{orderSaveMessage}</p>
                  {payerEmail && orderSaved && (
                    <p className="text-[10px] mt-2 opacity-60">📧 {payerEmail}</p>
                  )}
                  {!hankoFinalized && orderSaved && (
                    <p className="text-[10px] mt-1 text-amber-400/80 animate-pulse">⏳ Email will be sent after you confirm your seal above.</p>
                  )}
                </div>
              )}
            </div>

            {/* ===== SECTION 2: KAMON UPSELL ($3.99) ===== */}
            <div className="w-full flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
              <span className="text-[10px] text-gold/40 uppercase tracking-[0.5em] font-black">Premium</span>
              <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
            </div>

            <div className="w-full relative overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-[#0a1f2c]/80 flex flex-col p-6 items-center shadow-[0_10px_40px_rgba(212,175,55,0.15)] group hover:border-[#d4af37]/80 hover:bg-gold/5 transition-all">
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
                  <div className="flex flex-col gap-4">
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
                    
                    <div className="w-full bg-black/40 border border-gold/20 rounded-2xl p-5 overflow-hidden relative">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-gold text-[16px]">psychology</span>
                        <h6 className="text-[11px] font-black text-gold uppercase tracking-[0.2em]">{t('card.kamonExplanationTitle')}</h6>
                      </div>
                      
                      {isGeneratingKamonExplanation ? (
                        <div className="flex items-center gap-3 my-2 opacity-80">
                          <span className="material-symbols-outlined text-gold animate-spin text-[16px]">progress_activity</span>
                          <span className="text-[10px] text-white tracking-widest uppercase animate-pulse">{t('card.kamonGeneratingDesc')}</span>
                        </div>
                      ) : kamonExplanation ? (
                        <p className="text-[#f5e6be]/90 text-sm leading-relaxed font-medium">
                          {kamonExplanation}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <>
                    {!isGeneratingKamon && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1 mb-2">
                          <span className="text-[10px] text-gold/60 uppercase font-black tracking-tighter">{t('payment.kamonOneTime')}</span>
                          <span className="text-xl text-white font-black">{t('payment.kamonPrice')}</span>
                        </div>
                        <PayPalButtons 
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              intent: 'CAPTURE',
                              purchase_units: [{ amount: { value: "3.99", currency_code: "USD" } }]
                            });
                          }}
                          onApprove={async (data, actions) => {
                            if(actions.order) {
                              const details = await actions.order.capture();
                              const kamonEmail = (details as any)?.payer?.email_address || payerEmail;
                              const kamonPaypalOrderId = (details as any)?.id;
                              try {
                                setIsGeneratingKamon(true);
                                const kamonUrl = await clientGenerateKamon(candidate.meaning);
                                setKamonImage(kamonUrl);
                                setIsGeneratingKamon(false);

                                setIsGeneratingKamonExplanation(true);
                                const base64Data = kamonUrl.split(',')[1];
                                const explanation = await clientGenerateKamonExplanation(base64Data, candidate.meaning, nativeLocale);
                                setKamonExplanation(explanation);

                                // Save Kamon to server
                                if (kamonEmail && kamonPaypalOrderId) {
                                  try {
                                    await fetch('/api/save-kamon', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        paypalOrderId: kamonPaypalOrderId,
                                        email: kamonEmail,
                                        kamonUrl,
                                        kamonExplanation: explanation,
                                        amountPaid: 3.99
                                      })
                                    });
                                  } catch (saveErr) {
                                    console.error('[Circuit Breaker] Kamon save failed:', saveErr);
                                  }
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Generation failed, but your payment was successful. Please contact support.");
                                setIsGeneratingKamon(false);
                              } finally {
                                setIsGeneratingKamonExplanation(false);
                              }
                            }
                          }}
                          style={{ layout: "horizontal", height: 48, color: "gold", tagline: false, shape: "pill" }}
                        />
                      </div>
                    )}
                    <p className="text-center text-[10px] text-white/40 mt-3 font-medium uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[10px] align-middle mr-1">lock</span>
                      Secured by PayPal
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
