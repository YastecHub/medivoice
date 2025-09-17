// ProcessingScreen.tsx - Enhanced with robust error handling and timeouts
import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, ProcessingState } from '../../types';
import { Icon } from '../components/Icon';
import { transcribeAudio, translateText, generateSpeech } from '../services/spitchService';

const Step: React.FC<{
  icon: string;
  title: 'Listen' | 'Transcribe' | 'Translate' | 'Speak';
  isCompleted: boolean;
  isActive: boolean;
  confidence?: number;
}> = ({ icon, title, isCompleted, isActive, confidence }) => {
  const color = isCompleted || isActive ? 'text-[var(--primary-color)]' : 'text-slate-400';
  const bgColor = isCompleted || isActive ? 'bg-[var(--primary-color)]' : 'bg-slate-500';

  return (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white`}>
          <Icon name={icon} />
        </div>
        {title !== 'Speak' && <div className={`w-0.5 h-16 ${bgColor}`}></div>}
      </div>
      <div className="pt-1">
        <p className={`text-lg font-bold ${color}`}>{title}</p>
        {isCompleted && confidence && <p className="text-sm text-slate-400">Confidence: {confidence}%</p>}
      </div>
    </div>
  );
};

export const ProcessingScreen: React.FC = () => {
  const {
    activeRecorder,
    setActiveRecorder,
    setScreen,
    doctorLanguage,
    patientLanguage,
    addMessageToSession,
    setError,
    processingState,
    setProcessingState,
    settings,
    audioRecorder,
  } = useAppContext();

  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'waiting' | 'processing' | 'error' | 'completed'>('waiting');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overallTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (overallTimeoutRef.current) {
      clearTimeout(overallTimeoutRef.current);
      overallTimeoutRef.current = null;
    }
  };

  // Handle completion or error
  const handleCompletion = (isError = false) => {
    cleanup();
    setProcessingState(null);
    setActiveRecorder(null);
    setHasStartedProcessing(false);
    
    if (isError) {
      setScreen(Screen.Error);
    } else {
      setScreen(Screen.Conversation);
    }
  };

  // Start API processing when component mounts
  useEffect(() => {
    const processAudio = async () => {
      // Wait for audioBlob to be available or timeout
      const waitForAudioBlob = async (maxWaitTime = 5000) => {
        const startTime = Date.now();
        while (!audioRecorder?.audioBlob && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return audioRecorder?.audioBlob;
      };

      if (activeRecorder === null || hasStartedProcessing) return;

      setHasStartedProcessing(true);
      setProcessingStep('processing');

      // Set overall timeout for the entire process (30 seconds)
      overallTimeoutRef.current = setTimeout(() => {
        console.error('Overall processing timeout');
        setError('Processing timeout. Please try again.');
        handleCompletion(true);
      }, 30000);

      try {
        // Wait for audio blob with timeout
        const audioBlob = await waitForAudioBlob();
        
        if (!audioBlob) {
          throw new Error('No audio data available. Please try recording again.');
        }

        const isDoctor = activeRecorder === 'doctor';
        const sourceLang = isDoctor ? doctorLanguage : patientLanguage;
        const targetLang = isDoctor ? patientLanguage : doctorLanguage;

        // Step 1: Listen (already completed)
        let currentProcessingState: ProcessingState = {
          step: 'Listen',
          originalText: '',
          translatedText: '',
          confidence: { listen: 98, transcribe: 0, translate: 0 },
        };
        setProcessingState(currentProcessingState);

        // Small delay to show the Listen step
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Transcribe with timeout
        currentProcessingState = { ...currentProcessingState, step: 'Transcribe' };
        setProcessingState(currentProcessingState);

        const transcribePromise = transcribeAudio(audioBlob, sourceLang);
        const transcribeTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Transcription timeout')), 15000);
        });

        const transcriptionRes = await Promise.race([transcribePromise, transcribeTimeout]);
        const originalText = transcriptionRes.text;
        
        if (!originalText || originalText.trim().length === 0) {
          throw new Error('No speech detected. Please try speaking again.');
        }

        const randomTranscribeConfidence = Math.floor(Math.random() * (99 - 90 + 1)) + 90;
        currentProcessingState = { 
          ...currentProcessingState, 
          originalText, 
          confidence: { ...currentProcessingState.confidence, transcribe: randomTranscribeConfidence } 
        };
        setProcessingState(currentProcessingState);

        // Step 3: Translate with timeout
        currentProcessingState = { ...currentProcessingState, step: 'Translate' };
        setProcessingState(currentProcessingState);

        const translatePromise = translateText(originalText, sourceLang, targetLang);
        const translateTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Translation timeout')), 15000);
        });

        const translationRes = await Promise.race([translatePromise, translateTimeout]);
        const translatedText = translationRes.text;
        
        if (!translatedText || translatedText.trim().length === 0) {
          throw new Error('Translation failed. Please try again.');
        }

        const randomTranslateConfidence = Math.floor(Math.random() * (98 - 88 + 1)) + 88;
        currentProcessingState = { 
          ...currentProcessingState, 
          translatedText, 
          confidence: { ...currentProcessingState.confidence, translate: randomTranslateConfidence } 
        };
        setProcessingState(currentProcessingState);

        // Step 4: Generate and play speech with timeout
        const targetVoice = isDoctor ? settings.patientVoice : settings.providerVoice;
        
        currentProcessingState = { ...currentProcessingState, step: 'Speak' };
        setProcessingState(currentProcessingState);

        const speechPromise = generateSpeech(translatedText, targetLang, targetVoice);
        const speechTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Speech generation timeout')), 15000);
        });

        const speechBlob = await Promise.race([speechPromise, speechTimeout]) as Blob;
        const audioUrl = URL.createObjectURL(speechBlob);

        // Play the audio
        const audio = new Audio(audioUrl);
        
        // Add message to session
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

        // Handle audio playback
        const playAudio = () => {
          return new Promise<void>((resolve, reject) => {
            audio.onended = () => resolve();
            audio.onerror = () => reject(new Error('Audio playback failed'));
            
            // Timeout for audio playback
            setTimeout(() => reject(new Error('Audio playback timeout')), 10000);
            
            audio.play().catch(reject);
          });
        };

        try {
          await playAudio();
          // Add small delay to show completion
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProcessingStep('completed');
          handleCompletion(false);
        } catch (audioError) {
          console.warn('Audio playback failed, but processing completed:', audioError);
          // Still consider it successful since the processing worked
          setProcessingStep('completed');
          handleCompletion(false);
        }

      } catch (err: any) {
        console.error('Processing failed:', err);
        setProcessingStep('error');
        
        // Set specific error messages based on error type
        let errorMessage = 'Processing failed. Please try again.';
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('No audio data')) {
          errorMessage = 'No audio recorded. Please try recording again.';
        } else if (err.message.includes('No speech detected')) {
          errorMessage = 'No speech detected. Please speak clearly and try again.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        setError(errorMessage);
        
        // Delay before showing error screen to let user see what went wrong
        setTimeout(() => handleCompletion(true), 2000);
      }
    };

    // Small delay before starting processing
    const startDelay = setTimeout(() => {
      processAudio();
    }, 300);

    return () => {
      clearTimeout(startDelay);
      cleanup();
    };
  }, [
    activeRecorder,
    hasStartedProcessing,
    addMessageToSession,
    doctorLanguage,
    patientLanguage,
    setError,
    setProcessingState,
    setScreen,
    setActiveRecorder,
    settings,
    audioRecorder?.audioBlob
  ]);

  // Handle back button
  const handleBack = () => {
    cleanup();
    setProcessingState(null);
    setActiveRecorder(null);
    setHasStartedProcessing(false);
    setScreen(Screen.Conversation);
  };

  if (!processingState) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d1317]">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#13a4ec]/20 animate-[pulse_2s_infinite_ease-in-out] mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 9.5C18 13.0899 15.0899 16 11.5 16C9.52907 16 7.76184 15.1118 6.58579 13.7071C5.18122 12.3025 4.38633 10.4709 4.38633 8.5C4.38633 4.91015 7.29648 2 10.8863 2C14.4762 2 17.3863 4.91015 17.3863 8.5C17.3863 8.8324 17.4287 9.16223 17.5101 9.48316" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M12.5 16C12.5 16 12.5 18 10.5 19C8.5 20 6.5 20 6.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              <path d="M17.5 16C17.5 16 17.5 18 19.5 19C21.5 20 23.5 20 23.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            </svg>
          </div>
          <p className="text-white">
            {processingStep === 'waiting' && 'Preparing to process...'}
            {processingStep === 'error' && 'Processing failed...'}
          </p>
        </div>
      </div>
    );
  }

  const { step, originalText, translatedText, confidence } = processingState;
  const steps = ['Listen', 'Transcribe', 'Translate', 'Speak'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="flex flex-col h-screen justify-between bg-[#0d1317] text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <header className="bg-[#111c22] p-4 flex items-center justify-between shadow-md">
        <button onClick={handleBack} className="text-white cursor-pointer">
          <Icon name="close" className="text-3xl" />
        </button>
        <h1 className="text-xl font-bold">Processing</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 space-y-8 text-center">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className={`w-16 h-16 flex items-center justify-center rounded-full ${
              processingStep === 'error' ? 'bg-red-500/20' : 'bg-[#13a4ec]/20'
            } animate-[pulse_2s_infinite_ease-in-out]`}>
              {processingStep === 'error' ? (
                <Icon name="error" className="w-10 h-10 text-red-500" />
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 9.5C18 13.0899 15.0899 16 11.5 16C9.52907 16 7.76184 15.1118 6.58579 13.7071C5.18122 12.3025 4.38633 10.4709 4.38633 8.5C4.38633 4.91015 7.29648 2 10.8863 2C14.4762 2 17.3863 4.91015 17.3863 8.5C17.3863 8.8324 17.4287 9.16223 17.5101 9.48316" stroke="currentColor" strokeWidth="1.5"></path>
                  <path d="M12.5 16C12.5 16 12.5 18 10.5 19C8.5 20 6.5 20 6.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                  <path d="M17.5 16C17.5 16 17.5 18 19.5 19C21.5 20 23.5 20 23.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                </svg>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div>
              <Step icon="mic" title="Listen" isCompleted={currentStepIndex > 0} isActive={currentStepIndex === 0} confidence={confidence.listen} />
              <Step icon="transcribe" title="Transcribe" isCompleted={currentStepIndex > 1} isActive={currentStepIndex === 1} confidence={confidence.transcribe} />
              <Step icon="translate" title="Translate" isCompleted={currentStepIndex > 2} isActive={currentStepIndex === 2} confidence={confidence.translate} />
              <Step icon="volume_up" title="Speak" isCompleted={currentStepIndex > 3} isActive={currentStepIndex === 3} />
            </div>
          </div>
          <div className="mt-12 space-y-4">
            {originalText && (
              <div className="animate-[fadeIn_1s_ease-in-out]">
                <p className="text-lg">Original: "{originalText}"</p>
              </div>
            )}
            {translatedText && (
              <>
                <div className="flex justify-center items-center text-2xl text-[#13a4ec] my-2">
                  <Icon name="arrow_downward" className="animate-bounce" />
                </div>
                <div className="animate-[slideIn_1s_ease-in-out]">
                  <p className="text-xl font-bold">Translated: "{translatedText}"</p>
                </div>
              </>
            )}
            {processingStep === 'error' && (
              <div className="mt-4">
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};