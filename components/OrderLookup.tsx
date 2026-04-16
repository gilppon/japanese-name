import React, { useState } from 'react';
import { useTranslation } from '../i18n';

export const OrderLookup: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    found?: boolean;
    count?: number;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/lookup-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-transparent via-gold/5 to-transparent py-16 relative">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        
        {/* Header */}
        <div className="space-y-3">
          <span className="material-symbols-outlined text-gold/40 text-3xl">search</span>
          <h3 className="text-xl text-white font-bold tracking-tight">
            {t('lookup.title') !== 'lookup.title' ? t('lookup.title') : 'Find My Name Again'}
          </h3>
          <p className="text-[#f5e6be]/50 text-sm italic">
            {t('lookup.desc') !== 'lookup.desc' ? t('lookup.desc') : 'Enter the email you used during payment to receive your heritage links again.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#0a1f2c] border border-gold/20 rounded-full px-6 py-4 text-white text-sm placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
              required
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gold/20 text-[18px]">mail</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.includes('@')}
            className={`w-full uppercase tracking-[0.3em] text-sm font-black py-4 rounded-full transition-all flex items-center justify-center gap-3 ${
              isLoading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-white/5 text-gold border border-gold/20 hover:bg-gold/10 hover:border-gold/40'
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Searching...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">send</span>
                {t('lookup.button') !== 'lookup.button' ? t('lookup.button') : 'Send My Heritage Links'}
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`animate-fade-in rounded-2xl p-5 border text-sm ${
            result.found
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : result.success
                ? 'bg-gold/10 border-gold/20 text-gold/80'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm">
                {result.found ? 'check_circle' : result.success ? 'info' : 'error'}
              </span>
              <span className="font-bold uppercase tracking-widest text-[10px]">
                {result.found ? `${result.count} Name(s) Found` : result.success ? 'Not Found' : 'Error'}
              </span>
            </div>
            <p className="opacity-80">{result.message}</p>
          </div>
        )}

        {/* Security Note */}
        <p className="text-[10px] text-white/20 uppercase tracking-widest flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[10px]">lock</span>
          We only send links to the registered email
        </p>
      </div>
    </section>
  );
};
