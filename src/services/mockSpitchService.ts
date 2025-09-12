import { Language } from '../../types';

const MOCK_LATENCY = 1500; // ms

const mockTranslations: Record<string, string> = {
  "I'm experiencing a sharp pain in my lower abdomen.": "Mo ni irora nla ni ikun isale mi.",
  "Mo ni irora nla ni ikun isale mi.": "I'm experiencing a sharp pain in my lower abdomen.",
  "Hello doctor.": "Pẹlẹ o dokita.",
  "Pẹlẹ o dokita.": "Hello doctor.",
};

const mockTranscriptions: Record<Language, string> = {
  en: "I'm experiencing a sharp pain in my lower abdomen.",
  yo: "Mo ni irora nla ni ikun isale mi.",
  ha: "Ina jin zafi mai tsanani a cikin cikina na kasa.",
  ig: "Ana m mmetụta nnukwu mgbu na afo m di ala."
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const transcribeAudio = async (audioBlob: Blob, language: Language) => {
  console.log(`[MOCK] Transcribing audio for language: ${language}`);
  await delay(MOCK_LATENCY);
  const text = mockTranscriptions[language] || "This is a mock transcription.";
  console.log(`[MOCK] Transcription result: ${text}`);
  return { text };
};

export const translateText = async (text: string, source: Language, target: Language) => {
  console.log(`[MOCK] Translating text from ${source} to ${target}: "${text}"`);
  await delay(MOCK_LATENCY);
  const translatedText = mockTranslations[text] || "This is a mock translation.";
  console.log(`[MOCK] Translation result: ${translatedText}`);
  return { text: translatedText };
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const createSilentWavBlob = (duration: number = 1): Blob => {
  const sampleRate = 44100;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = Math.round(duration * byteRate);
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  return new Blob([view], { type: 'audio/wav' });
};

export const generateSpeech = async (text: string, language: Language, voice: string): Promise<Blob> => {
  console.log(`[MOCK] Generating speech for language ${language}, voice ${voice}: "${text}"`);
  await delay(MOCK_LATENCY);
  const blob = createSilentWavBlob(2);
  console.log(`[MOCK] Speech generation complete.`);
  return blob;
};