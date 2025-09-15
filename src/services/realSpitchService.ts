import { Language } from '../../types';

const API_BASE_URL = 'https://api.spi-tch.com/v1';

const API_KEY = process.env.SPITCH_API_KEY;

if (!API_KEY || API_KEY === "YOUR_SPITCH_API_KEY_HERE") {
    console.warn("Spitch API key not set. Real API calls will fail. Please set it in services/realSpitchService.ts");
}

const getAuthHeaders = () => {
    return {
        'Authorization': `Bearer ${API_KEY}`,
    };
};

export const transcribeAudio = async (audioBlob: Blob, language: Language) => {
    const url = `${API_BASE_URL}/transcriptions`;
    const formData = new FormData();
    formData.append('language', language);
    formData.append('model', 'mansa_v1');
    formData.append('content', audioBlob, 'recording.wav');
    formData.append('timestamp', 'sentence');

    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Transcription failed: ${response.statusText} - ${errorBody}`);
    }
    return response.json();
};

export const translateText = async (text: string, source: Language, target: Language) => {
    const url = `${API_BASE_URL}/translate`;
    const options = {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, target, text }),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Translation failed: ${response.statusText} - ${errorBody}`);
    }
    return response.json();
};

export const generateSpeech = async (text: string, language: Language, voice: string) => {
    const url = `${API_BASE_URL}/speech`;
    const options = {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, text, voice, model: 'legacy' }),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Speech generation failed: ${response.statusText} - ${errorBody}`);
    }
    return response.blob();
};
