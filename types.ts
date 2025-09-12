export enum Screen {
  Welcome,
  Conversation,
  Recording,
  Processing,
  History,
  Settings,
  Error,
}

export type Language = 'en' | 'yo' | 'ha' | 'ig';

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ig', name: 'Igbo' },
];

export type Speaker = 'doctor' | 'patient';

export interface Message {
  id: string;
  speaker: Speaker;
  originalText: string;
  translatedText: string;
  originalLang: Language;
  translatedLang: Language;
  confidence: number;
  audioUrl?: string;
}

export interface Session {
  id: string;
  date: string;
  duration: number; // in seconds
  languages: { doctor: Language; patient: Language };
  messages: Message[];
  title: string;
}

export interface Settings {
  micVolume: number;
  speakerVolume: number;
  patientLanguage: Language;
  providerLanguage: Language;
  patientVoice: string;
  providerVoice: string;
  highQualityRecording: boolean;
  autoSave: boolean;
}

export interface ProcessingState {
  step: 'Listen' | 'Transcribe' | 'Translate' | 'Speak';
  originalText: string;
  translatedText: string;
  confidence: {
    listen: number;
    transcribe: number;
    translate: number;
  };
}