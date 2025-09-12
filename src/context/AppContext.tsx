import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Screen, Language, Session, Message, Speaker, Settings, ProcessingState, LANGUAGES } from '../../types';
import { useAudioRecorder, AudioRecorderState } from '../hooks/useAudioRecorder';

const initialSettings: Settings = {
  micVolume: 75,
  speakerVolume: 50,
  patientLanguage: 'yo',
  providerLanguage: 'en',
  patientVoice: 'sade',
  providerVoice: 'john',
  highQualityRecording: true,
  autoSave: false,
};

interface AppContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  doctorLanguage: Language;
  setDoctorLanguage: (lang: Language) => void;
  patientLanguage: Language;
  setPatientLanguage: (lang: Language) => void;
  sessions: Session[];
  addSession: (session: Session) => void;
  setSessions: (sessions: Session[]) => void; // Added this method
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  startNewSession: () => void;
  addMessageToSession: (message: Omit<Message, 'id'>) => void;
  activeRecorder: Speaker | null;
  setActiveRecorder: (speaker: Speaker | null) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  error: string | null;
  setError: (error: string | null) => void;
  processingState: ProcessingState | null;
  setProcessingState: (state: ProcessingState | null) => void;
  audioRecorder: AudioRecorderState;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screen>(Screen.Welcome);
  const [doctorLanguage, setDoctorLanguage] = useState<Language>('en');
  const [patientLanguage, setPatientLanguage] = useState<Language>('yo');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [activeRecorder, setActiveRecorder] = useState<Speaker | null>(null);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);

  const audioRecorder = useAudioRecorder();

  const addSession = (session: Session) => {
    setSessions(prev => [...prev, session]);
  };

  const startNewSession = useCallback(() => {
    const newSession: Session = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      duration: 0,
      languages: { doctor: doctorLanguage, patient: patientLanguage },
      messages: [],
      title: 'Patient Consultation',
    };
    setCurrentSession(newSession);
    setScreen(Screen.Conversation);
  }, [doctorLanguage, patientLanguage]);

  const addMessageToSession = useCallback((message: Omit<Message, 'id'>) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      const newMessage: Message = { ...message, id: new Date().getTime().toString() };
      return { ...prev, messages: [...prev.messages, newMessage] };
    });
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleSetError = (newError: string | null) => {
    setError(newError);
    if(newError) {
      setScreen(Screen.Error);
    }
  };

  return (
    <AppContext.Provider value={{
      screen,
      setScreen,
      doctorLanguage,
      setDoctorLanguage,
      patientLanguage,
      setPatientLanguage,
      sessions,
      addSession,
      setSessions, // Added to context value
      currentSession,
      setCurrentSession,
      startNewSession,
      addMessageToSession,
      activeRecorder,
      setActiveRecorder,
      settings,
      updateSettings,
      error,
      setError: handleSetError,
      processingState,
      setProcessingState,
      audioRecorder,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};