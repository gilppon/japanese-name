import React from 'react';
import { FontType, NameCandidate, UserProfile } from '../types';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from '../i18n';

interface NameCardProps {
  candidate: NameCandidate;
  index: number;
  font: FontType;
  userProfile: UserProfile | null;
  onPaymentSuccess: (candidate: NameCandidate) => void;
}

export const NameCard: React.FC<NameCardProps> = ({ candidate, font, userProfile, onPaymentSuccess }) => {
  const { t } = useTranslation();

  return (
    <div className="relative bg-[#0a1f2c] rounded-3xl shadow-2xl border border-gold/10 overflow-hidden min-h-[380px] flex flex-col group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)]">
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
              'font-minimal'
            }`}>
              {candidate.kanji}
            </h3>

            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-gold/50 to-transparent my-2"></div>

            <div className="w-full px-2 max-h-[140px] overflow-y-auto custom-scrollbar">
              <p className="text-[#f5e6be] text-sm font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic origin-center text-center">
                "{candidate.meaning}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#04151f] p-6 border-t border-gold/20 relative z-20 flex flex-col gap-4 rounded-b-3xl">
         <div className="w-full text-center space-y-4">
           {/* Benefits List */}
           <div className="bg-gold/5 rounded-2xl p-4 border border-gold/10 text-left">
             <h5 className="text-[10px] text-gold font-black uppercase tracking-widest mb-2 flex items-center gap-2">
               <span className="material-symbols-outlined text-[14px]">verified</span>
               {t('payment.heritageBundle')}
             </h5>
             <ul className="space-y-1.5">
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

           <div className="flex items-center justify-between px-1 mb-2">
             <div className="text-left">
                <span className="block text-[10px] text-gold/60 uppercase font-black tracking-tighter">{t('payment.oneTimeFee')}</span>
                <span className="text-xl text-white font-black">{t('payment.price')}</span>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-gold/80 uppercase tracking-widest font-black flex items-center justify-end gap-1">
                   <span className="material-symbols-outlined text-[14px] animate-pulse">auto_awesome</span>
                   {t('payment.revealCta')}
                </p>
             </div>
           </div>

           <PayPalButtons 
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [{ amount: { value: "1.99", currency_code: "USD" } }]
                });
              }}
              onApprove={async (data, actions) => {
                if(actions.order) {
                  await actions.order.capture();
                  onPaymentSuccess(candidate);
                }
              }}
              style={{ layout: "horizontal", height: 48, color: "gold", tagline: false, shape: "pill" }}
           />
         </div>
      </div>
    </div>
  );
};