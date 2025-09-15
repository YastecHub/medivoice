import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, ProcessingState } from '../../types';
import { Icon } from '../components/Icon';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio, translateText, generateSpeech } from '../services/spitchService';

export const ActiveRecordingScreen: React.FC = () => {
  const {
    activeRecorder,
    setActiveRecorder,
    setScreen,
    doctorLanguage,
    patientLanguage,
    addMessageToSession,
    setError,
    setProcessingState,
    settings,
  } = useAppContext();

  const audioRecorder = useAudioRecorder();

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    audioRecorder.startRecording();
  }, [audioRecorder]);

  useEffect(() => {
    if (audioRecorder.error) {
      setError(audioRecorder.error);
    }
  }, [audioRecorder.error, setError]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (audioRecorder.isRecording) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [audioRecorder.isRecording]);

  const handleStop = useCallback(async () => {
    audioRecorder.stopRecording();
  }, [audioRecorder]);

  useEffect(() => {
    const processAudio = async () => {
      if (!audioRecorder.audioBlob || activeRecorder === null) return;

      const isDoctor = activeRecorder === 'doctor';
      const sourceLang = isDoctor ? doctorLanguage : patientLanguage;
      const targetLang = isDoctor ? patientLanguage : doctorLanguage;

      try {
        let currentProcessingState: ProcessingState = {
          step: 'Listen',
          originalText: '',
          translatedText: '',
          confidence: { listen: 98, transcribe: 0, translate: 0 },
        };
        setProcessingState(currentProcessingState);
        setScreen(Screen.Processing);

        const transcriptionRes = await transcribeAudio(audioRecorder.audioBlob, sourceLang);
        const originalText = transcriptionRes.text;
        const randomTranscribeConfidence = Math.floor(Math.random() * (99 - 90 + 1)) + 90;
        currentProcessingState = { ...currentProcessingState, step: 'Transcribe', originalText, confidence: { ...currentProcessingState.confidence, transcribe: randomTranscribeConfidence } };
        setProcessingState(currentProcessingState);

        const translationRes = await translateText(originalText, sourceLang, targetLang);
        const translatedText = translationRes.text;
        const randomTranslateConfidence = Math.floor(Math.random() * (98 - 88 + 1)) + 88;
        currentProcessingState = { ...currentProcessingState, step: 'Translate', translatedText, confidence: { ...currentProcessingState.confidence, translate: randomTranslateConfidence } };
        setProcessingState(currentProcessingState);

        const targetVoice = isDoctor ? settings.patientVoice : settings.providerVoice;
        const speechBlob = await generateSpeech(translatedText, targetLang, targetVoice);
        const audioUrl = URL.createObjectURL(speechBlob);
        currentProcessingState = { ...currentProcessingState, step: 'Speak' };
        setProcessingState(currentProcessingState);

        const audio = new Audio(audioUrl);
        audio.play();

        const randomConfidence = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
        addMessageToSession({
          speaker: activeRecorder,
          originalText,
          translatedText,
          originalLang: sourceLang,
          translatedLang: targetLang,
          confidence: randomConfidence,
          audioUrl,
        });

        // Fallback timer to ensure transition if audio fails
        const timeoutId = setTimeout(() => {
          setProcessingState(null);
          setActiveRecorder(null);
          setScreen(Screen.Conversation);
        }, 5000); // 5 seconds timeout

        audio.onended = () => {
          clearTimeout(timeoutId); // Clear timeout if audio ends naturally
          setProcessingState(null);
          setActiveRecorder(null);
          setScreen(Screen.Conversation);
        };
      } catch (err: any) {
        console.error('Processing failed:', err);
        setError(`Processing failed: ${err.message}`);
        setProcessingState(null);
        setActiveRecorder(null);
        setScreen(Screen.Conversation);
      }
    };

    if (!audioRecorder.isRecording && audioRecorder.audioBlob) {
      processAudio();
    }
  }, [audioRecorder.isRecording, audioRecorder.audioBlob, activeRecorder, addMessageToSession, doctorLanguage, patientLanguage, setError, setProcessingState, setScreen, setActiveRecorder, settings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (audioRecorder.permissionGranted === null && !audioRecorder.isRecording) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-gray-900/50 backdrop-blur-lg justify-center items-center text-white p-4 text-center" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
        <Icon name="mic" className="text-6xl mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold">Requesting Access</h1>
        <p className="text-lg text-gray-300 mt-2">Please allow microphone access to continue.</p>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-900/50 backdrop-blur-lg justify-between group/design-root" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <div className="flex-grow flex flex-col justify-center items-center text-white p-4">
        <div className="relative flex justify-center items-center mb-8">
          <div className="absolute w-64 h-64 rounded-full bg-sky-500/20 animate-[ring-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
          <div className="absolute w-48 h-48 rounded-full bg-sky-500/30 animate-[ring-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ animationDelay: '0.5s' }}></div>
          <button className="relative flex items-center justify-center rounded-full h-32 w-32 bg-[#1193d4] text-white shadow-lg animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            <svg
              fill="currentColor"
              height="64px"
              viewBox="0 0 256 256"
              width="64px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
            </svg>
          </button>
        </div>
        <p className="text-xl font-medium text-gray-300 mb-4 capitalize">{activeRecorder} Speaking...</p>
        <div className="w-full max-w-lg mb-8">
          <svg height="60" preserveAspectRatio="none" viewBox="0 0 500 60" width="100%">
            <path d="M0 30 C 50 10, 100 50, 150 30 S 250 10, 300 30 S 400 50, 450 30 S 500 10, 500 30" fill="none" stroke="#1193d4" stroke-width="2"></path>
            <path d="M0 30 C 50 40, 100 20, 150 30 S 250 40, 300 30 S 400 20, 450 30 S 500 40, 500 30" fill="none" stroke="#1193d4" stroke-opacity="0.5" stroke-width="1"></path>
          </svg>
        </div>
        <p className="text-2xl font-light text-center max-w-2xl">
          The patient reports experiencing persistent <span className="text-white font-medium">headaches</span> and <span className="text-white font-medium">dizziness</span> over the past week.
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center text-white">
          <p className="text-lg font-mono">{formatTime(timer)}</p>
        </div>
        <button onClick={handleStop} className="w-full max-w-md mx-auto flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold leading-normal tracking-wider shadow-lg">
          <span className="truncate">STOP</span>
        </button>
      </div>
    </div>
  );
};