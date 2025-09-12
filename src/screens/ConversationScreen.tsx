import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../../types';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';
import {SpeakerPanel} from './SpeakerPanel';

export const ConversationScreen: React.FC = () => {
  const { setScreen, addSession, currentSession, setCurrentSession, setProcessingState } = useAppContext();

  const endSession = () => {
    if (currentSession) {
      const duration = currentSession.messages.length * 60; // Placeholder: 60 seconds per message
      addSession({ ...currentSession, duration });
    }
    setCurrentSession(null);
    
    setProcessingState({
      step: 'Listen',
      originalText: '',
      translatedText: '',
      confidence: { listen: 98, transcribe: 0, translate: 0 },
    });
    setScreen(Screen.Processing);
    
    setTimeout(() => {
      setProcessingState(null);
      setScreen(Screen.History);
    }, 3000); // 3 seconds delay for processing
  };

  const isEndSessionDisabled = !currentSession || currentSession.messages.length === 0;

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#1C1C1E]" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      <header className="p-4 flex items-center justify-between text-white">
        <div className="text-sm text-gray-400">01:23</div>
        <div className="flex items-center gap-2">
          <Icon name="wifi" className="text-gray-400" />
          <Icon name="battery_full" className="text-gray-400" />
        </div>
      </header>
      <main className="grid grid-cols-2 gap-4 px-4 flex-grow">
        <SpeakerPanel speaker="doctor" />
        <SpeakerPanel speaker="patient" />
      </main>
      <div className="p-4 flex items-center justify-center gap-4">
        <button className="bg-[#2C2C2E] p-4 rounded-full text-white cursor-pointer"><Icon name="language" /></button>
        <button onClick={endSession} className={`flex-1 py-4 px-6 ${isEndSessionDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#ea2a33] hover:bg-red-700 cursor-pointer'} text-white text-lg font-bold rounded-full flex items-center justify-center gap-2`} disabled={isEndSessionDisabled}>
          <Icon name="pause" /> END SESSION
        </button>
        <button className="bg-[#2C2C2E] p-4 rounded-full text-white cursor-pointer"><Icon name="swap_horiz" /></button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ConversationScreen;