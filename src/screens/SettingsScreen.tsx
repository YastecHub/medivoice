import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, Language, LANGUAGES } from '../../types';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, setScreen } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-color)]" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <header className="sticky top-0 z-10 flex items-center bg-white/80 p-4 backdrop-blur-sm">
        <button onClick={() => setScreen(Screen.Conversation)} className="text-[var(--text-primary)] flex size-10 shrink-0 items-center justify-center rounded-full cursor-pointer">
          <Icon name="arrow_back" className="text-3xl" />
        </button>
        <h1 className="text-[var(--text-primary)] text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10">Settings</h1>
      </header>

      <main className="p-4 space-y-8 flex-grow">
        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-semibold px-2 pb-4">Audio</h2>
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div>
              <label className="block text-base font-medium">Microphone Volume: {settings.micVolume}%</label>
              <input type="range" min="0" max="100" value={settings.micVolume} onChange={e => updateSettings({ micVolume: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <label className="block text-base font-medium">Speaker Volume: {settings.speakerVolume}%</label>
              <input type="range" min="0" max="100" value={settings.speakerVolume} onChange={e => updateSettings({ speakerVolume: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-semibold px-2 pb-4">Language</h2>
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div>
              <label className="block text-base font-medium mb-2">Patient Language</label>
              <select value={settings.patientLanguage} onChange={e => updateSettings({ patientLanguage: e.target.value as Language })} className="w-full p-2 border rounded-md cursor-pointer">
                {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">Provider Language</label>
              <select value={settings.providerLanguage} onChange={e => updateSettings({ providerLanguage: e.target.value as Language })} className="w-full p-2 border rounded-md cursor-pointer">
                {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-semibold px-2 pb-4">About</h2>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-gray-600 text-sm">Powered by Spitch ASR/TTS APIs for African languages. This app is designed to bridge communication gaps in healthcare.</p>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};