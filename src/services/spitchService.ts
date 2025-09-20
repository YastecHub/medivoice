import { Language } from '../../types';
import * as RealSpitchService from './realSpitchService';
import * as MockSpitchService from './mockSpitchService';

// Set this to true to use mock data for development and testing.
// This allows testing the UI flow without making real API calls.
const USE_MOCK_API = false; 

export const transcribeAudio = (audioBlob: Blob, language: Language) => {
    return USE_MOCK_API
        ? MockSpitchService.transcribeAudio(audioBlob, language)
        : RealSpitchService.transcribeAudio(audioBlob, language);
};

export const translateText = (text: string, source: Language, target: Language) => {
    return USE_MOCK_API
        ? MockSpitchService.translateText(text, source, target)
        : RealSpitchService.translateText(text, source, target);
};

export const generateSpeech = (text: string, language: Language, voice: string) => {
    return USE_MOCK_API
        ? MockSpitchService.generateSpeech(text, language, voice)
        : RealSpitchService.generateSpeech(text, language, voice);
};
