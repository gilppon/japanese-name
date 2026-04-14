
export enum Style {
  Pop = 'Pop',
  Minimal = 'Minimal',
  Feminine = 'Feminine',
  Traditional = 'Traditional',
}

export enum FontType {
  Brush = 'Brush',
  Serif = 'Serif',
  Handwritten = 'Handwritten',
  Minimal = 'Minimal',
}

export const PERSONALITY_TRAITS = [
  'Courage (勇気)', 'Wisdom (智慧)', 'Patience (忍耐)',
  'Justice (正義)', 'Loyalty (忠誠)', 'Mercy (慈悲)',
  'Honor (名誉)', 'Sincerity (誠実)', 'Creativity (創意)',
] as const;

export type PersonalityTrait = typeof PERSONALITY_TRAITS[number];

export interface UserProfile {
  name: string;
  birthday: string;       // YYYY-MM-DD
  personality: PersonalityTrait[];  // 최대 3개
  gender: 'male' | 'female' | 'neutral';
}

export interface NameCandidate {
  kanji: string;
  hiragana: string;
  meaning: string;
  kamonUrl?: string;
}
