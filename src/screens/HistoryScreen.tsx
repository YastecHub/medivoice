import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, Session, LANGUAGES } from '../../types';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';

const SessionCard: React.FC<{ session: Session; onContinue?: (session: Session) => void }> = ({ session, onContinue }) => {
  const { sessions, setSessions, setCurrentSession, setScreen } = useAppContext();
  const getLangName = (code: string) => LANGUAGES.find(l => l.code === code)?.name || code;

  const handleDownload = () => {
    const transcript = session.messages.map(msg => `${msg.speaker}: ${msg.originalText} - "${msg.translatedText}"`).join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(sessions.filter(s => s.id !== session.id));
    }
  };

  const handleContinue = () => {
    if (onContinue) onContinue(session);
    setScreen(Screen.Conversation);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer" onClick={handleContinue}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
        <div className="flex space-x-2">
          <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="text-gray-500 hover:text-gray-700 cursor-pointer"><Icon name="download" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="text-gray-500 hover:text-red-500 cursor-pointer"><Icon name="delete" /></button>
        </div>
      </div>
      <h3 className="mb-1 text-base font-bold text-gray-900">{session.title}</h3>
      <p className="mb-3 text-sm text-gray-600">
        Duration: {Math.floor(session.duration / 60)} minutes | Languages: {getLangName(session.languages.doctor)}, {getLangName(session.languages.patient)}
      </p>
      <details>
        <summary className="cursor-pointer text-sm font-medium text-blue-600">View Transcript</summary>
        <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 max-h-40 overflow-y-auto">
          {session.messages.map(msg => (
            <p key={msg.id} className="mb-2">
              <strong className="capitalize">{msg.speaker}:</strong> {msg.originalText} <br />
              <span className="text-gray-500 italic">" {msg.translatedText} "</span>
            </p>
          ))}
        </div>
      </details>
    </div>
  );
};

export const HistoryScreen: React.FC = () => {
  const { sessions, setScreen, setCurrentSession } = useAppContext();

  const handleContinueSession = (session: Session) => {
    setCurrentSession(session);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-800" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <header className="flex items-center justify-between border-b bg-white p-4 sticky top-0">
        <button onClick={() => setScreen(Screen.Conversation)} className="text-gray-600 cursor-pointer">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">Sessions</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="relative mb-6">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full rounded-full border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-gray-800 focus:border-blue-500 focus:ring-blue-500" placeholder="Search sessions" type="text" />
        </div>
        
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Past Sessions</h2>
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map(session => <SessionCard key={session.id} session={session} onContinue={handleContinueSession} />)
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No sessions recorded yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};