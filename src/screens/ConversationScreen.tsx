import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, Speaker, Language, LANGUAGES } from '../../types';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';
import { SpeakerPanel } from './SpeakerPanel';

export const ConversationScreen: React.FC = () => {
  const { setScreen, addSession, currentSession, setCurrentSession, setProcessingState, doctorLanguage, patientLanguage, setDoctorLanguage, setPatientLanguage, settings, updateSettings } = useAppContext();

  const [sessionTime, setSessionTime] = useState(0);
  const [showVoiceMenu, setShowVoiceMenu] = useState<Speaker | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentSession) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession]);

  // Set initial voices based on selected languages when session starts
  useEffect(() => {
    if (currentSession && !currentSession.languages) {
      const initialDoctorVoice = getAvailableVoices(doctorLanguage)[0] || 'john';
      const initialPatientVoice = getAvailableVoices(patientLanguage)[0] || 'sade';
      updateSettings({ providerVoice: initialDoctorVoice, patientVoice: initialPatientVoice });
    }
  }, [doctorLanguage, patientLanguage, currentSession, updateSettings]);

  const endSession = () => {
    if (currentSession) {
      const duration = sessionTime; // Use actual session time
      addSession({ ...currentSession, duration });
    }
    setCurrentSession(null);
    setSessionTime(0);
    
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
    }, 3000);
  };

  const isEndSessionDisabled = !currentSession || currentSession.messages.length === 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleVoiceMenuClick = (speaker: Speaker) => {
    setShowVoiceMenu(speaker);
    setIsMenuOpen(true);
  };

  const handleVoiceChange = (speaker: Speaker, voice: string) => {
    if (speaker === 'doctor') {
      updateSettings({ providerVoice: voice });
    } else {
      updateSettings({ patientVoice: voice });
    }
    setIsMenuOpen(false);
    setShowVoiceMenu(null);
  };

  const voicesByLanguage: Record<Language, string[]> = {
    en: ['john', 'jude', 'lina', 'lucy', 'henry'],
    yo: ['sade', 'segun', 'femi', 'funmi'],
    ha: ['amina', 'aliyu', 'hasan', 'zainab'],
    ig: ['kani', 'ngozi', 'amara', 'obinna', 'ebuka'],
  };

  const getAvailableVoices = (lang: Language) => voicesByLanguage[lang] || [];

  const doctorVoices = getAvailableVoices(doctorLanguage);
  const patientVoices = getAvailableVoices(patientLanguage);

  const getVoiceName = (voice: string) => {
    const voiceMap = {
      john: 'John (Male, English)',
      jude: 'Jude (Male, English)',
      lina: 'Lina (Female, English)',
      lucy: 'Lucy (Female, English)',
      henry: 'Henry (Male, English)',
      sade: 'Sade (Female, Yoruba)',
      segun: 'Segun (Male, Yoruba)',
      femi: 'Femi (Male, Yoruba)',
      funmi: 'Funmi (Female, Yoruba)',
      amina: 'Amina (Female, Hausa)',
      aliyu: 'Aliyu (Male, Hausa)',
      hasan: 'Hasan (Male, Hausa)',
      zainab: 'Zainab (Female, Hausa)',
      kani: 'Kani (Male, Igbo)',
      ngozi: 'Ngozi (Female, Igbo)',
      amara: 'Amara (Female, Igbo)',
      obinna: 'Obinna (Male, Igbo)',
      ebuka: 'Ebuka (Male, Igbo)',
    };
    return voiceMap[voice as keyof typeof voiceMap] || voice;
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#1C1C1E]" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      <header className="p-4 flex items-center justify-between text-white">
        <div className="text-sm text-gray-400 font-mono">
          {currentSession ? formatTime(sessionTime) : '00:00'}
        </div>
      </header>
      <main className="grid grid-cols-2 gap-4 px-4 flex-grow">
        <SpeakerPanel speaker="doctor" />
        <SpeakerPanel speaker="patient" />
      </main>
      <div className="p-4 flex items-center justify-center gap-4 relative">
        <div className="relative">
          <button 
            onClick={() => handleVoiceMenuClick('doctor')} 
            className="bg-[#2C2C2E] p-4 rounded-full text-white cursor-pointer hover:bg-gray-600 transition-colors"
            title="Change Doctor Voice"
          >
            <Icon name="person" />
          </button>
          {showVoiceMenu === 'doctor' && isMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50 overflow-y-auto max-h-48">
              <div className="p-2">
                <p className="text-sm text-gray-300 mb-2 px-3">Doctor Voice ({LANGUAGES.find(l => l.code === doctorLanguage)?.name})</p>
                {doctorVoices.map(voice => (
                  <button
                    key={voice}
                    onClick={() => handleVoiceChange('doctor', voice)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded transition-colors"
                  >
                    {getVoiceName(voice)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={endSession} 
          className={`flex-1 py-4 px-6 text-white text-lg font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${
            isEndSessionDisabled 
              ? 'bg-gray-500 cursor-not-allowed opacity-50' 
              : 'bg-[#ea2a33] hover:bg-red-700 cursor-pointer shadow-lg hover:shadow-xl'
          }`}
          disabled={isEndSessionDisabled}
        >
          <Icon name="pause" /> END SESSION
        </button>

        <div className="relative">
          <button 
            onClick={() => handleVoiceMenuClick('patient')} 
            className="bg-[#2C2C2E] p-4 rounded-full text-white cursor-pointer hover:bg-gray-600 transition-colors"
            title="Change Patient Voice"
          >
            <Icon name="person" />
          </button>
          {showVoiceMenu === 'patient' && isMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50 overflow-y-auto max-h-48">
              <div className="p-2">
                <p className="text-sm text-gray-300 mb-2 px-3">Patient Voice ({LANGUAGES.find(l => l.code === patientLanguage)?.name})</p>
                {patientVoices.map(voice => (
                  <button
                    key={voice}
                    onClick={() => handleVoiceChange('patient', voice)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded transition-colors"
                  >
                    {getVoiceName(voice)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ConversationScreen;