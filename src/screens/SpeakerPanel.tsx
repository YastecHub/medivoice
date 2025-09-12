import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, Speaker, LANGUAGES, Message } from '../../types';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';

export const SpeakerPanel: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const {
    setActiveRecorder,
    setScreen,
    currentSession,
    doctorLanguage,
    patientLanguage,
  } = useAppContext();
  const isDoctor = speaker === 'doctor';
  const language = isDoctor ? doctorLanguage : patientLanguage;
  const languageName = LANGUAGES.find(l => l.code === language)?.name || '';

  const messagesForSpeaker = currentSession?.messages.filter(m => m.speaker === speaker) || [];
  const lastMessage = messagesForSpeaker[messagesForSpeaker.length - 1];

  const handleSpeakClick = () => {
    console.log('Speak clicked for', speaker);
    setActiveRecorder(speaker);
    setScreen(Screen.Recording);
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 bg-[#2C2C2E] rounded-3xl h-full">
      <h2 className="text-white text-xl font-bold capitalize">{speaker}</h2>
      <div className="w-full flex flex-col items-center">
        <div className="relative w-36 h-36 lg:w-48 lg:h-48 mb-4">
          <div className={`absolute inset-0 border-4 border-gray-600 rounded-full ${isDoctor ? 'border-dashed animate-pulse' : ''} z-0`}></div>
          <button
            onClick={handleSpeakClick}
            className={`relative z-10 w-full h-full flex items-center justify-center text-white rounded-full shadow-lg ${isDoctor ? 'bg-[#ea2a33]' : 'bg-gray-700'} cursor-pointer`}
          >
            <Icon name="mic" className="text-6xl" />
          </button>
        </div>
        <p className="text-white font-bold text-lg mb-4">SPEAK</p>
      </div>
      <div className="w-full text-left overflow-y-auto text-sm lg:text-base">
        {lastMessage ? (
          <>
            <div className="mb-4">
              <p className="text-gray-400 text-xs lg:text-sm mb-1">{languageName} (Original)</p>
              <p className="text-white">{lastMessage.originalText}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs lg:text-sm mb-1">
                {isDoctor ? LANGUAGES.find(l => l.code === patientLanguage)?.name : 'English'} (Translated)
              </p>
              <p className="text-white">{lastMessage.translatedText}</p>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400">Press SPEAK to start</div>
        )}
      </div>
      {lastMessage && (
        <div className="w-full mt-4">
          <p className="text-gray-400 text-sm mb-1">Confidence: {lastMessage.confidence}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${confidenceColor(lastMessage.confidence)} h-2.5 rounded-full`} style={{ width: `${lastMessage.confidence}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

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
        <button onClick={endSession} className="flex-1 py-4 px-6 bg-[#ea2a33] text-white text-lg font-bold rounded-full flex items-center justify-center gap-2 cursor-pointer">
          <Icon name="pause" /> END SESSION
        </button>
        <button className="bg-[#2C2C2E] p-4 rounded-full text-white cursor-pointer"><Icon name="swap_horiz" /></button>
      </div>
      <BottomNav />
    </div>
  );
};