import React from 'react';
import { Icon } from './Icon';
import { useAppContext } from '../../src/context/AppContext';
import { Screen } from '../../types';

const NavItem: React.FC<{
  icon: string;
  label: string;
  screen: Screen;
  activeScreen: Screen;
  onClick: (screen: Screen) => void;
}> = ({ icon, label, screen, activeScreen, onClick }) => {
  const isActive = screen === activeScreen;
  const color = isActive ? 'text-[#1193d4]' : 'text-gray-300';
  const background = isActive ? 'bg-[#1193d4]/20 rounded-lg' : '';

  return (
    <button
      onClick={() => onClick(screen)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${color} ${background} cursor-pointer transition-all duration-200 hover:bg-gray-700`}
    >
      <Icon name={icon} className={isActive ? 'text-lg' : 'text-base'} />
      <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  );
};

export const BottomNav = () => {
  const { screen, setScreen, currentSession } = useAppContext();
  const navItems = [
    { icon: 'home', label: 'Home', screen: Screen.Conversation },
    { icon: 'forum', label: 'Consultation', screen: Screen.Conversation },
    { icon: 'history', label: 'History', screen: Screen.History },
    { icon: 'settings', label: 'Settings', screen: Screen.Settings }
  ];

  const isNavVisible = [Screen.Conversation, Screen.History, Screen.Settings].includes(screen);

const handleNavClick = (screen: Screen) => {
    if ((screen === Screen.Conversation || screen === Screen.History) && !currentSession && (screen === Screen.Conversation || screen === Screen.History)) {
      setScreen(Screen.Welcome);
    } else if (screen === Screen.Conversation && !currentSession) {
      setScreen(Screen.Welcome);
    } else {
      setScreen(screen);
    }
  };

  if (!isNavVisible) return null;

  return (
    <footer className="sticky bottom-0 z-50 bg-[#1C1C1E] border-t border-gray-700 shadow-lg">
      <nav className="flex justify-around p-3">
        {navItems.map(item => (
          <NavItem 
            key={item.label}
            icon={item.icon}
            label={item.label}
            screen={item.screen}
            activeScreen={screen}
            onClick={handleNavClick}
          />
        ))}
      </nav>
    </footer>
  );
};