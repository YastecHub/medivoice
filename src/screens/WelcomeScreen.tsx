import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { useAppContext } from '../context/AppContext';
import { Language, LANGUAGES, Screen } from '../../types';
import { Icon } from '../components/Icon';
import { LanguageSelector } from './LanguageSelector';

// Set app element for accessibility (add this in your main app file if not already)
ReactModal.setAppElement('#root');

export const WelcomeScreen: React.FC = () => {
  const { doctorLanguage, setDoctorLanguage, patientLanguage, setPatientLanguage, startNewSession, setScreen } = useAppContext();

  const [showLanguageError, setShowLanguageError] = useState(false);

  const handleDoctorLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    if (newLang === patientLanguage) {
      setShowLanguageError(true);
    } else {
      setDoctorLanguage(newLang);
      setShowLanguageError(false);
    }
  };

  const handlePatientLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    if (newLang === doctorLanguage) {
      setShowLanguageError(true);
    } else {
      setPatientLanguage(newLang);
      setShowLanguageError(false);
    }
  };

  const handleStartSession = () => {
    if (doctorLanguage !== patientLanguage) {
      startNewSession();
    } else {
      setShowLanguageError(true);
    }
  };

  const closeLanguageError = () => {
    setShowLanguageError(false);
  };

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
            <LanguageSelector value={doctorLanguage} onChange={handleDoctorLanguageChange} />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] text-left">Patient</h2>
            <LanguageSelector value={patientLanguage} onChange={handlePatientLanguageChange} />
          </div>
        </div>
      </main>
      <footer className="p-4 sm:p-6 w-full max-w-4xl mx-auto">
        <button
          onClick={handleStartSession}
          className="w-full bg-[var(--primary-color)] hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg text-xl transition-colors duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] cursor-pointer"
          disabled={doctorLanguage === patientLanguage}
        >
          Start Session
        </button>
      </footer>

      <ReactModal
        isOpen={showLanguageError}
        onRequestClose={closeLanguageError}
        contentLabel="Language Selection Error"
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        ariaHideApp={false} // Set to false if not using appElement
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100">
            <Icon name="error" className="text-xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Language Selection Error</h2>
        </div>
        <p className="text-gray-700 mb-6">Doctor and Patient languages must be different. Please select different languages to continue.</p>
        <div className="flex justify-end">
          <button
            onClick={closeLanguageError}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            OK
          </button>
        </div>
      </ReactModal>
    </div>
  );
};