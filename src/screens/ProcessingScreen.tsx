import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../../types';
import { Icon } from '../components/Icon';

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
  const { processingState, setScreen } = useAppContext();

  useEffect(() => {
    if (processingState && processingState.step === 'Speak') {
      // Automatically transition back after a short delay to ensure playback completes
      const timeoutId = setTimeout(() => {
        setScreen(Screen.Conversation);
      }, 3000); // 3 seconds to allow speech to play

      return () => clearTimeout(timeoutId);
    }
  }, [processingState, setScreen]);

  if (!processingState) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d1317]">
        <p className="text-white">No processing state found...</p>
      </div>
    );
  }

  const { step, originalText, translatedText, confidence } = processingState;
  const steps = ['Listen', 'Transcribe', 'Translate', 'Speak'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="flex flex-col h-screen justify-between bg-[#0d1317] text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <header className="bg-[#111c22] p-4 flex items-center justify-between shadow-md">
        <button onClick={() => setScreen(Screen.Conversation)} className="text-white cursor-pointer">
          <Icon name="close" className="text-3xl" />
        </button>
        <h1 className="text-xl font-bold">Processing</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 space-y-8 text-center">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#13a4ec]/20 animate-[pulse_2s_infinite_ease-in-out]">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 9.5C18 13.0899 15.0899 16 11.5 16C9.52907 16 7.76184 15.1118 6.58579 13.7071C5.18122 12.3025 4.38633 10.4709 4.38633 8.5C4.38633 4.91015 7.29648 2 10.8863 2C14.4762 2 17.3863 4.91015 17.3863 8.5C17.3863 8.8324 17.4287 9.16223 17.5101 9.48316" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M12.5 16C12.5 16 12.5 18 10.5 19C8.5 20 6.5 20 6.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                <path d="M17.5 16C17.5 16 17.5 18 19.5 19C21.5 20 23.5 20 23.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
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
            {originalText && <div className="animate-[fadeIn_1s_ease-in-out]"><p className="text-lg">Original: "{originalText}"</p></div>}
            {translatedText && (
              <>
                <div className="flex justify-center items-center text-2xl text-[#13a4ec] my-2">
                  <Icon name="arrow_downward" className="animate-bounce" />
                </div>
                <div className="animate-[slideIn_1s_ease-in-out]"><p className="text-xl font-bold">Translated: "{translatedText}"</p></div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};