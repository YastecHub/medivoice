import { Language } from '../../types';

const SPITCH_API_KEY = process.env.SPITCH_API_KEY; // Set in .env or environment
const API_BASE_URL = 'https://api.spi-tch.com/v1';
const USE_MOCK_API = true; // Toggle to false for real API

// Mock functions (as before)
const mockTranscriptions: Record<Language, string> = {
  en: "I'm experiencing a sharp pain in my lower abdomen.",
  yo: "Mo ni irora nla ni ikun isale mi.",
  ha: "Ina jin zafi mai tsanani a cikin cikina na kasa.",
  ig: "Ana m mmetụta nnukwu mgbu na afo m di ala.",
  // am: "በታችኛው ሆዴ ላይ ከባድ ህመም ይሰማኛል.",
};

const mockTranslations: Record<string, string> = {
  "I'm experiencing a sharp pain in my lower abdomen.": "Mo ni irora nla ni ikun isale mi.",
  "Mo ni irora nla ni ikun isale mi.": "I'm experiencing a sharp pain in my lower abdomen.",
  "Hello doctor.": "Pẹlẹ o dokita.",
  "Pẹlẹ o dokita.": "Hello doctor.",
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockTranscribeAudio = async (audioBlob: Blob, language: Language) => {
  await delay(1500);
  return { text: mockTranscriptions[language] || "Mock transcription" };
};

const mockTranslateText = async (text: string, source: Language, target: Language) => {
  await delay(1500);
  return { text: mockTranslations[text] || "Mock translation" };
};

const mockGenerateSpeech = async (text: string, language: Language, voice: string): Promise<Blob> => {
  await delay(1500);
  return new Blob([], { type: 'audio/wav' }); // Mock silent audio
};

// Real Spitch API functions
const realTranscribeAudio = async (audioBlob: Blob, language: Language) => {
  try {
    const formData = new FormData();
    formData.append('content', audioBlob, 'audio.wav');
    formData.append('language', language);
    formData.append('model', 'mansa_v1');

    const response = await fetch(`${API_BASE_URL}/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPITCH_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error) {
    console.error('Real transcription error:', error);
    throw error;
  }
};

const realTranslateText = async (text: string, source: Language, target: Language) => {
  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPITCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source,
        target,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error) {
    console.error('Real translation error:', error);
    throw error;
  }
};

const realGenerateSpeech = async (text: string, language: Language, voice: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPITCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
        voice,
        model: 'legacy',
      }),
    });

    if (!response.ok) {
      throw new Error(`Speech generation failed: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Real speech generation error:', error);
    throw error;
  }
};

// Exported functions (toggle between mock and real)
export const transcribeAudio = USE_MOCK_API ? mockTranscribeAudio : realTranscribeAudio;
export const translateText = USE_MOCK_API ? mockTranslateText : realTranslateText;
export const generateSpeech = USE_MOCK_API ? mockGenerateSpeech : realGenerateSpeech;