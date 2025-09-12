import React from 'react';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { Screen } from './types';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { ConversationScreen } from './src/screens/ConversationScreen';
import { ActiveRecordingScreen } from './src/screens/ActiveRecordingScreen';
import { ProcessingScreen } from './src/screens/ProcessingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ErrorScreen } from './src/screens/ErrorScreen';

const ScreenManager: React.FC = () => {
  const { screen } = useAppContext();

  switch (screen) {
    case Screen.Welcome:
      return <WelcomeScreen />;
    case Screen.Conversation:
      return <ConversationScreen />;
    case Screen.Recording:
      return <ActiveRecordingScreen />;
    case Screen.Processing:
      return <ProcessingScreen />;
    case Screen.History:
      return <HistoryScreen />;
    case Screen.Settings:
      return <SettingsScreen />;
    case Screen.Error:
      return <ErrorScreen />;
    default:
      return <WelcomeScreen />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="w-screen h-screen bg-gray-100">
        <ScreenManager />
      </div>
    </AppProvider>
  );
};

export default App;