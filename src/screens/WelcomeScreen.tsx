// WelcomeScreen.tsx
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Language, LANGUAGES, Screen } from '../../types';
import { Icon } from '../components/Icon';
import { LanguageSelector } from './LanguageSelector';

export const WelcomeScreen: React.FC = () => {
  const { doctorLanguage, setDoctorLanguage, patientLanguage, setPatientLanguage, startNewSession, setScreen } = useAppContext();

  return (
    <div className="relative flex size-full min-h-screen flex-col justify-between bg-[var(--background-color)]" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <header className="absolute top-0 right-0 p-6 z-10">
        <button onClick={() => setScreen(Screen.Settings)} className="text-gray-600 hover:text-[var(--primary-color)] transition-colors cursor-pointer">
          <Icon name="settings" className="text-3xl" />
        </button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <svg className="w-16 h-16 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 9.5C18 13.0899 15.0899 16 11.5 16C9.52907 16 7.76184 15.1118 6.58579 13.7071C5.18122 12.3025 4.38633 10.4709 4.38633 8.5C4.38633 4.91015 7.29648 2 10.8863 2C14.4762 2 17.3863 4.91015 17.3863 8.5C17.3863 8.8324 17.4287 9.16223 17.5101 9.48316" stroke="currentColor" strokeWidth="1.5"></path>
            <path d="M12.5 16C12.5 16 12.5 18 10.5 19C8.5 20 6.5 20 6.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            <path d="M17.5 16C17.5 16 17.5 18 19.5 19C21.5 20 23.5 20 23.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            <path d="M12 21.5C15.866 21.5 19 18.366 19 14.5C19 12.9818 18.508 11.5644 17.671 10.414" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
            <path d="M7 14.5C7 16.71 8.29 18.5 10 19.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">MediVoice</h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-2">Breaking Language Barriers in Healthcare</p>
        <div className="w-full max-w-4xl mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] text-left">Doctor</h2>
            <LanguageSelector value={doctorLanguage} onChange={(e) => setDoctorLanguage(e.target.value as Language)} />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] text-left">Patient</h2>
            <LanguageSelector value={patientLanguage} onChange={(e) => setPatientLanguage(e.target.value as Language)} />
          </div>
        </div>
      </main>
      <footer className="p-4 sm:p-6 w-full max-w-4xl mx-auto">
        <button
          onClick={startNewSession}
          className="w-full bg-[var(--primary-color)] hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg text-xl transition-colors duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] cursor-pointer"
        >
          Start Session
        </button>
      </footer>
    </div>
  );
};