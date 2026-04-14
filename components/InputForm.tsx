import React, { useState } from 'react';
import { Style, FontType, PERSONALITY_TRAITS, PersonalityTrait, UserProfile } from '../types';
import { useTranslation } from '../i18n';

interface InputFormProps {
  onSubmit: (profile: UserProfile, style: Style, font: FontType) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<PersonalityTrait[]>([]);
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [selectedStyle, setSelectedStyle] = useState<Style>(Style.Feminine);
  const [selectedFont, setSelectedFont] = useState<FontType>(FontType.Brush);

  const toggleTrait = (trait: PersonalityTrait) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length < 3 ? [...prev, trait] : prev
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && birthday && selectedTraits.length > 0) {
      const profile: UserProfile = {
        name,
        birthday,
        personality: selectedTraits,
        gender,
      };
      onSubmit(profile, selectedStyle, selectedFont);
    }
  };

  const genderOptions = [
    { value: 'male' as const, label: '武士', sub: t('form.genderSamurai') },
    { value: 'female' as const, label: '姫', sub: t('form.genderPrincess') },
    { value: 'neutral' as const, label: '道', sub: t('form.genderNeutral') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Name Input */}
      <div className="group relative">
        <label htmlFor="name" className="block text-xs font-black text-gold/40 mb-3 ml-1 uppercase tracking-[0.4em]">
          {t('form.nameLabel')}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('form.namePlaceholder')}
          className="w-full px-8 py-6 bg-white/[0.03] border-2 border-gold/10 rounded-3xl focus:ring-8 focus:ring-gold/5 focus:border-gold/40 focus:bg-white/[0.07] transition-all outline-none text-2xl font-display font-medium text-white placeholder-gold/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          required
        />
      </div>

      {/* Birthday & Gender Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="birthday" className="block text-xs font-black text-gold/40 mb-3 ml-1 uppercase tracking-[0.4em]">
            {t('form.birthdayLabel')}
          </label>
          <input
            type="date"
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full px-6 py-4 bg-white/[0.03] border-2 border-gold/10 rounded-2xl focus:ring-4 focus:ring-gold/5 focus:border-gold/40 transition-all outline-none text-lg text-white font-medium shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] [color-scheme:dark]"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-black text-gold/40 mb-3 ml-1 uppercase tracking-[0.4em]">
            {t('form.genderLabel')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {genderOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(opt.value)}
                className={`px-3 py-3 rounded-2xl font-bold transition-all duration-300 border-2 text-center ${
                  gender === opt.value
                    ? 'bg-gold border-transparent text-gray-900 shadow-lg scale-105'
                    : 'bg-white/5 border-gold/10 text-gold/40 hover:border-gold/30'
                }`}
              >
                <div className="text-xl font-brush">{opt.label}</div>
                <div className="text-[9px] mt-0.5 opacity-60 uppercase tracking-wider">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      <div>
        <label className="block text-xs font-black text-gold/40 mb-2 ml-1 uppercase tracking-[0.4em]">
          {t('form.traitsLabel')} <span className="text-gold/20 normal-case tracking-normal">{t('form.traitsHint')}</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PERSONALITY_TRAITS.map((trait) => (
            <button
              key={trait}
              type="button"
              onClick={() => toggleTrait(trait)}
              className={`px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                selectedTraits.includes(trait)
                  ? 'bg-red-900/60 border-red-500/50 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/5 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold/70'
              }`}
            >
              {t(`traits.${trait}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Style & Font Selection */}
      <div className="space-y-8">
        <div>
          <label className="block text-xs font-black text-gold/40 mb-4 ml-1 uppercase tracking-[0.4em]">
            {t('form.styleLabel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.values(Style).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-4 rounded-2xl font-bold transition-all duration-500 border-2 relative overflow-hidden group/btn ${
                  selectedStyle === style
                    ? 'bg-gold border-transparent text-gray-900 shadow-[0_20px_50px_-10px_rgba(212,175,55,0.5)] scale-105 z-10'
                    : 'bg-white/5 border-gold/10 text-gold/40 hover:border-gold/40 hover:text-gold hover:bg-white/10'
                }`}
              >
                <div className="relative z-10">{style}</div>
                {selectedStyle === style && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gold/40 mb-4 ml-1 uppercase tracking-[0.4em]">
            {t('form.fontLabel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.values(FontType).map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => setSelectedFont(font)}
                className={`px-4 py-4 rounded-2xl font-bold transition-all duration-500 border-2 ${
                  selectedFont === font
                    ? 'bg-white text-gray-900 border-transparent shadow-xl scale-105 z-10'
                    : 'bg-white/5 border-gold/10 text-gold/40 hover:border-[#d4af37]/40 hover:text-gold'
                }`}
              >
                <div className={
                  font === FontType.Brush ? 'font-brush text-xl' :
                  font === FontType.Serif ? 'font-serif-jp text-xl' :
                  font === FontType.Handwritten ? 'font-hand text-xl' :
                  'font-minimal'
                }>
                  {font === FontType.Brush ? '書法' :
                   font === FontType.Serif ? '明朝' :
                   font === FontType.Handwritten ? '手描' :
                   '極小'}
                </div>
                <div className="text-[10px] mt-1 opacity-60 uppercase tracking-tighter">{font}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !name.trim() || !birthday || selectedTraits.length === 0}
        className="group w-full relative overflow-hidden bg-gold text-gray-900 font-black text-xl py-8 px-8 rounded-3xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 disabled:pointer-events-none shadow-[0_20px_80px_-15px_rgba(212,175,55,0.4)]"
      >
        <div className="relative z-10 flex items-center justify-center gap-6 tracking-[0.5em] uppercase">
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-4 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
              <span>{t('form.submitLoading')}</span>
            </>
          ) : (
            <>
              <span>{t('form.submitButton')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-3 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        <div className="absolute inset-0 border-4 border-black/5 rounded-3xl"></div>
      </button>
    </form>
  );
};