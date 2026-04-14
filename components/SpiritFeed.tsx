
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';

interface SpiritActivity {
  id: number;
  name: string;
  kanji: string;
  location: string;
  time: string;
}

const activities: SpiritActivity[] = [
  { id: 1, name: 'James', kanji: '慈英', location: 'London', time: '2m ago' },
  { id: 2, name: 'Minji', kanji: '美知', location: 'Seoul', time: '5m ago' },
  { id: 3, name: 'Elena', kanji: '瑛玲菜', location: 'Madrid', time: '8m ago' },
  { id: 4, name: 'Hiroshi', kanji: '浩', location: 'Tokyo', time: '12m ago' },
  { id: 5, name: 'Sophia', kanji: '蘇妃亜', location: 'New York', time: '15m ago' },
];

export const SpiritFeed: React.FC = () => {
  const { t, locale } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activity = activities[currentIndex];

  return (
    <div className="w-full h-12 bg-black/40 backdrop-blur-md border-y border-gold/10 flex items-center justify-center overflow-hidden transition-all duration-1000">
      <div 
        key={activity.id}
        className="flex items-center gap-6 animate-slide-up"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-gold/60">
            {t('feed.live')}
          </span>
        </div>
        
        <div className="h-4 w-[1px] bg-gold/20"></div>

        <p className="text-sm font-medium text-[#f5e6be]/80">
          <span className="text-white font-bold">{activity.name}</span>
          <span className="mx-2 text-gold/40">from {activity.location}</span>
          {locale === 'ko' ? '님이 ' : ' discovered '}
          <span className="text-white font-brush text-xl mx-2 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
            {activity.kanji}
          </span>
          {locale === 'ko' ? '을(를) 발견했습니다.' : ''}
        </p>

        <span className="text-[10px] text-gold/30 uppercase italic font-bold">
          {activity.time}
        </span>
      </div>
    </div>
  );
};
