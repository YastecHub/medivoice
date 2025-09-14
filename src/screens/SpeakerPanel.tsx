import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, Speaker, LANGUAGES, Message, Language } from '../../types';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';

export const SpeakerPanel: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const {
    setActiveRecorder,
    setScreen,
    currentSession,
    doctorLanguage,
    patientLanguage,
    settings,
  } = useAppContext();
  const isDoctor = speaker === 'doctor';
  const language = isDoctor ? doctorLanguage : patientLanguage;
  const languageName = LANGUAGES.find(l => l.code === language)?.name || '';
  const currentVoice = isDoctor ? settings.providerVoice : settings.patientVoice;

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

  const getVoiceName = (voice: string) => {
    const voiceMap = {
      john: 'John (Male)',
      jude: 'Jude (Male)',
      lina: 'Lina (Female)',
      lucy: 'Lucy (Female)',
      henry: 'Henry (Male)',
      sade: 'Sade (Female)',
      segun: 'Segun (Male)',
      femi: 'Femi (Male)',
      funmi: 'Funmi (Female)',
      amina: 'Amina (Female)',
      aliyu: 'Aliyu (Male)',
      hasan: 'Hasan (Male)',
      zainab: 'Zainab (Female)',
      kani: 'Kani (Male)',
      ngozi: 'Ngozi (Female)',
      amara: 'Amara (Female)',
      obinna: 'Obinna (Male)',
      ebuka: 'Ebuka (Male)',
      hana: 'Hana (Female)',
      selam: 'Selam (Female)',
      tena: 'Tena (Female)',
      tesfaye: 'Tesfaye (Male)',
    };
    return voiceMap[voice as keyof typeof voiceMap] || voice;
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
        <p className="text-white font-bold text-lg mb-1">SPEAK</p>
        <p className="text-xs text-gray-400 mb-4">{getVoiceName(currentVoice)}</p>
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

export default SpeakerPanel;