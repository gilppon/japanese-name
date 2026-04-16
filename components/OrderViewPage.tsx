import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n';
import { FontType } from '../types';
import type { PurchaseRecord } from '../types';

declare const html2canvas: any;

interface OrderViewPageProps {
  orderId: string;
  onBack: () => void;
}

export const OrderViewPage: React.FC<OrderViewPageProps> = ({ orderId, onBack }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<PurchaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/order/${orderId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found. This link may have expired or is invalid.');
        } else {
          setError('Failed to load your heritage. Please try again.');
        }
        return;
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a1f2c',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `kanji-name-${order?.kanji || 'heritage'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#04151f] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <span className="material-symbols-outlined text-gold text-4xl animate-spin">hourglass_empty</span>
          <p className="text-gold/60 text-xs uppercase tracking-[0.5em] font-black">Loading Heritage...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#04151f] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <span className="material-symbols-outlined text-red-400/60 text-5xl">error_outline</span>
          <h2 className="text-white text-xl font-bold">Heritage Not Found</h2>
          <p className="text-[#f5e6be]/60 text-sm">{error || 'This order could not be found.'}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gold/30 text-gold text-xs uppercase tracking-widest font-black rounded-full hover:bg-gold/10 transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04151f] text-[#f5e6be] pb-20">
      {/* Fixed Texture Overlay */}
      <div className="fixed inset-0 washi-pattern pointer-events-none z-[100]"></div>

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#04151f]/90 backdrop-blur-xl border-b border-gold/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gold/60 hover:text-gold transition-colors text-xs uppercase tracking-widest font-black"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Home
          </button>
          <span className="text-[10px] text-gold/30 uppercase tracking-[0.4em] font-black">Heritage Vault</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] text-gold/50 uppercase tracking-[0.5em] font-black">Permanent Heritage</span>
          <h1 className="text-2xl text-white font-bold">{order.original_name}'s Japanese Name</h1>
        </div>

        {/* Name Card */}
        <div className="w-full flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="text-center">
            <p className="text-gold font-black tracking-[0.8em] text-xs uppercase mb-2 ml-[0.8em]">
              {order.hiragana}
            </p>
            <h3 className="text-8xl text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-none font-brush">
              {order.kanji}
            </h3>
          </div>
          <div className="w-full text-center px-4 mt-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-gold/60 text-[14px]">auto_awesome</span>
              <p className="text-[10px] text-gold/60 uppercase tracking-[0.4em] font-black">Meaning</p>
            </div>
            <p className="text-[#f5e6be] text-base font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic">
              "{order.meaning}"
            </p>
          </div>
        </div>

        {/* Hanko Seal */}
        {order.hanko_url && (
          <div className="w-full flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col items-center text-center mb-2">
              <span className="text-gold tracking-[0.4em] text-[10px] uppercase font-black mb-1">Practical Use</span>
              <h4 className="text-xl text-white font-bold tracking-tight">Your Hanko Seal</h4>
            </div>
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-40 h-40 bg-white/95 rounded-full flex items-center justify-center p-4 shadow-2xl relative border-4 border-red-600/30">
                <img src={order.hanko_url} alt="Hanko Stamp" className="w-full h-full object-contain filter contrast-125" />
              </div>
            </div>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = order.hanko_url!;
                link.download = `hanko-${order.kanji}.png`;
                link.click();
              }}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest border border-gold/30 px-6 py-3 rounded-full text-gold hover:text-white hover:border-gold hover:bg-gold/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download Stamp (PNG)
            </button>
          </div>
        )}

        {/* Heirloom Card with Deep Meaning + Lore */}
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
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a1f2c]/40 via-transparent to-[#0a1f2c]/90 pointer-events-none"></div>

            <div className="relative z-10 p-8 flex flex-col items-center min-h-[400px]">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-12 bg-gold/40"></div>
                <span className="text-gold tracking-[0.5em] text-[10px] uppercase font-black">Heirloom Edition</span>
                <div className="h-[1px] w-12 bg-gold/40"></div>
              </div>

              <div className="text-center mb-8">
                <p className="text-gold font-black tracking-[0.8em] text-xs uppercase mb-2 ml-[0.8em]">{order.hiragana}</p>
                <h3 className="text-8xl text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-none font-brush">
                  {order.kanji}
                </h3>
              </div>

              {/* Deep Meaning */}
              {order.deep_meaning && (
                <div className="w-full text-left mb-10 px-4">
                  <div className="flex items-center justify-center gap-2 mb-3 text-center">
                    <span className="material-symbols-outlined text-gold/60 text-[14px]">auto_awesome</span>
                    <p className="text-[10px] text-gold/60 uppercase tracking-[0.4em] font-black">Meaning</p>
                  </div>
                  <div className="bg-black/30 border border-gold/10 rounded-xl p-5 text-left">
                    {order.deep_meaning.split('\n').map((line, i) => {
                      const isHeading = line.startsWith('[') || line.startsWith('✨');
                      return (
                        <p key={i} className={`text-[#f5e6be] text-sm leading-relaxed ${isHeading ? 'font-bold mt-4 mb-1 text-gold/90' : 'font-medium opacity-90'}`}>
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lore */}
              {order.lore_text && (
                <div className="w-full bg-gradient-to-b from-black/40 to-black/60 rounded-2xl p-6 border border-gold/20 relative overflow-hidden">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-[1px] w-6 bg-gold/30"></div>
                    <p className="text-[10px] text-gold/60 uppercase tracking-[0.4em] font-black">Family Lore</p>
                    <div className="h-[1px] w-6 bg-gold/30"></div>
                  </div>
                  <p className="text-[#f5e6be]/90 text-sm leading-[1.8] font-medium whitespace-pre-line text-center">
                    {order.lore_text}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full uppercase tracking-[0.3em] text-sm font-black py-4 rounded-full transition-all flex items-center justify-center gap-3 bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/40"
          >
            <span className="material-symbols-outlined">download</span>
            Download Heirloom Card
          </button>
        </div>

        {/* Kamon Section */}
        {order.kamon_url && (
          <div className="w-full relative overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-[#0a1f2c]/80 flex flex-col p-6 items-center shadow-[0_10px_40px_rgba(212,175,55,0.15)]">
            <div className="absolute inset-0 washi-pattern opacity-10 pointer-events-none"></div>
            
            <div className="relative w-full aspect-square max-w-[150px] mx-auto bg-white/95 rounded-2xl border-4 border-gold/40 mb-5 flex p-4 shadow-2xl">
              <div className="absolute inset-0 washi-pattern opacity-30 pointer-events-none"></div>
              <img src={order.kamon_url} alt="Kamon Crest" className="w-full h-full object-contain filter contrast-125 relative z-10" />
            </div>

            <h5 className="text-gold font-black tracking-[0.3em] uppercase text-sm mb-4">Your Family Crest</h5>

            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = order.kamon_url!;
                link.download = `kamon-${order.kanji}.png`;
                link.click();
              }}
              className="w-full relative z-10 bg-gradient-to-r from-[#d4af37] via-[#f5d179] to-[#d4af37] text-[#0a1f2c] uppercase tracking-[0.1em] text-sm font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download Kamon (PNG)
            </button>

            {order.kamon_explanation && (
              <div className="w-full bg-black/40 border border-gold/20 rounded-2xl p-5 overflow-hidden relative mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-gold text-[16px]">psychology</span>
                  <h6 className="text-[11px] font-black text-gold uppercase tracking-[0.2em]">Crest Symbolism</h6>
                </div>
                <p className="text-[#f5e6be]/90 text-sm leading-relaxed font-medium">
                  {order.kamon_explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest">
            <span>Order: {order.id.substring(0, 8)}...</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
