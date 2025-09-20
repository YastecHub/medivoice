import { Language } from '../../types';

const SPITCH_API_KEY = process.env.SPITCH_API_KEY; // Set in .env or environment
const API_BASE_URL = 'https://api.spi-tch.com/v1';
const USE_MOCK_API = false; // Toggle to false for real API

// Mock functions (as before)
const mockTranscriptions: Record<Language, string> = {
  en: "I'm experiencing a sharp pain in my lower abdomen.",
  yo: "Mo ni irora nla ni ikun isale mi.",
  ha: "Ina jin zafi mai tsanani a cikin cikina na kasa.",
  ig: "Ana m mmetụta nnukwu mgbu na afo m di ala.",
};

const mockTranslations: Record<string, string> = {
  "I'm experiencing a sharp pain in my lower abdomen.": "Mo ni irora nla ni ikun isale mi.",
  "Mo ni irora nla ni ikun isale mi.": "I'm experiencing a sharp pain in my lower abdomen.",
  "Hello doctor.": "Pẹlẹ o dokita.",
  "Pẹlẹ o dokita.": "Hello doctor.",
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockTranscribeAudio = async (audioBlob: Blob, language: Language) => {
  await delay(1500);
  return { text: mockTranscriptions[language] || "Mock transcription" };
};

export const mockTranslateText = async (text: string, source: Language, target: Language) => {
  await delay(1500);
  return { text: mockTranslations[text] || "Mock translation" };
};

export const mockGenerateSpeech = async (text: string, language: Language, voice: string): Promise<Blob> => {
  await delay(1500);
  // Return a valid audio Blob (e.g., a short silent WAV)
  const arrayBuffer = new ArrayBuffer(44); // Minimal WAV header
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

// Utility function to convert audio to proper format for API
const prepareAudioForAPI = async (audioBlob: Blob): Promise<{ blob: Blob; filename: string; mimeType: string }> => {
  console.log('Original blob type:', audioBlob.type);
  
  // Ensure minimum size
  if (audioBlob.size < 100) {
    throw new Error('Audio file is too small. Please record for a longer duration.');
  }
  
  // For WebM files, we need to actually convert the format, not just change the MIME type
  if (audioBlob.type.includes('webm')) {
    console.log('Trying with audio/wav...');
    
    try {
      // Convert WebM to WAV using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Convert to WAV format
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        
        console.log('Successfully converted WebM to WAV:', {
          originalSize: audioBlob.size,
          convertedSize: wavBlob.size,
          originalType: audioBlob.type,
          convertedType: 'audio/wav'
        });
        
        return { 
          blob: wavBlob, 
          filename: 'audio.wav', 
          mimeType: 'audio/wav' 
        };
      } catch (decodeError) {
        console.warn('Failed to decode WebM audio, trying direct upload:', decodeError);
        // If conversion fails, try uploading the original WebM with proper filename
        return { 
          blob: audioBlob, 
          filename: 'audio.webm', 
          mimeType: 'audio/webm' 
        };
      }
    } catch (error) {
      console.error('Audio conversion failed:', error);
      // Fallback to original
      return { 
        blob: audioBlob, 
        filename: 'audio.webm', 
        mimeType: 'audio/webm' 
      };
    }
  }
  
  // For non-WebM files, handle as before
  let filename = 'audio.wav';
  let mimeType = 'audio/wav';
  
  if (audioBlob.type.includes('wav')) {
    filename = 'audio.wav';
    mimeType = 'audio/wav';
  } else if (audioBlob.type.includes('mp4')) {
    filename = 'audio.mp4';
    mimeType = 'audio/mp4';
  } else if (audioBlob.type.includes('ogg')) {
    filename = 'audio.ogg';
    mimeType = 'audio/ogg';
  } else {
    // Default to WAV
    const wavBlob = new Blob([audioBlob], { type: 'audio/wav' });
    return { blob: wavBlob, filename: 'audio.wav', mimeType: 'audio/wav' };
  }
  
  return { blob: audioBlob, filename, mimeType };
};

// Helper function to convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Convert audio data to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return arrayBuffer;
};

// Real Spitch API functions
const realTranscribeAudio = async (audioBlob: Blob, language: Language) => {
  try {
    const { blob: preparedBlob, filename } = await prepareAudioForAPI(audioBlob);
    
    const formData = new FormData();
    formData.append('content', preparedBlob, filename);
    formData.append('language', language);
    formData.append('model', 'mansa_v1');

    console.log('Sending transcription request:', {
      filename,
      size: preparedBlob.size,
      type: preparedBlob.type,
      language,
      model: 'mansa_v1'
    });

    const response = await fetch(`${API_BASE_URL}/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPITCH_API_KEY}`,
      },
      body: formData,
    });

    console.log('Transcription response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription error response:', errorText);
      
      // Parse error details if available
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Transcription failed: ${errorData.detail || errorData.message || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Transcription failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Transcription successful:', data);
    return { text: data.text };
  } catch (error) {
    console.error('Real transcription error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('invalid audio file')) {
        throw new Error('Audio format not supported. Please try recording again.');
      } else if (error.message.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('401')) {
        throw new Error('API authentication failed. Please check your API key.');
      } else if (error.message.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw error;
    }
    
    throw new Error('Transcription failed. Please try again.');
  }
};

const realTranslateText = async (text: string, source: Language, target: Language) => {
  try {
    console.log('Sending translation request:', { text, source, target });

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

    console.log('Translation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Translation failed: ${errorData.detail || errorData.message || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Translation successful:', data);
    return { text: data.text };
  } catch (error) {
    console.error('Real translation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('API authentication failed. Please check your API key.');
      } else if (error.message.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw error;
    }
    
    throw new Error('Translation failed. Please try again.');
  }
};

const realGenerateSpeech = async (text: string, language: Language, voice: string): Promise<Blob> => {
  try {
    console.log('Sending speech generation request:', { text, language, voice });

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

    console.log('Speech generation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speech generation error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Speech generation failed: ${errorData.detail || errorData.message || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Speech generation failed: ${response.status} ${response.statusText}`);
      }
    }

    const blob = await response.blob();
    console.log('Speech generation successful:', { size: blob.size, type: blob.type });
    return blob;
  } catch (error) {
    console.error('Real speech generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('API authentication failed. Please check your API key.');
      } else if (error.message.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw error;
    }
    
    throw new Error('Speech generation failed. Please try again.');
  }
};

// Exported functions (toggle between mock and real)
export const transcribeAudio = USE_MOCK_API ? mockTranscribeAudio : realTranscribeAudio;
export const translateText = USE_MOCK_API ? mockTranslateText : realTranslateText;
export const generateSpeech = USE_MOCK_API ? mockGenerateSpeech : realGenerateSpeech;