import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../../types';
import { Icon } from '../components/Icon';

export const ErrorScreen: React.FC = () => {
  const { error, setError, setScreen } = useAppContext();

  const handleRetry = () => {
    setError(null);
    setScreen(Screen.Welcome);
  };

  return (
    <div className="flex size-full min-h-screen flex-col justify-center items-center bg-slate-50 p-4" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
        <Icon name="error" className="text-red-500 text-6xl mb-4" />
        <h2 className="text-2xl font-bold text-[#0d171b] mb-2">Connection Error</h2>
        <p className="text-[#4c809a] text-base mb-6">
          {error || 'An unknown error occurred. Please check your internet connection and try again.'}
        </p>

        <div className="w-full bg-slate-100 rounded-lg p-3 mb-6 flex items-center justify-between">
          <span className="text-slate-600 font-medium">Connection Status</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-500 font-semibold">Disconnected</span>
          </div>
        </div>

        <button onClick={handleRetry} className="w-full flex items-center justify-center rounded-lg h-12 px-6 bg-[#1193d4] text-white text-base font-bold transition-all duration-300 hover:bg-[#0f82b9] active:scale-95 mb-4 cursor-pointer">
          Retry
        </button>
        
        <button onClick={() => setScreen(Screen.Welcome)} className="mt-6 text-[#4c809a] text-sm font-medium hover:text-[#1193d4] transition-colors duration-300 cursor-pointer">
          Return to Main Screen
        </button>
      </div>
    </div>
  );
};