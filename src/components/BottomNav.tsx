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
  const color = isActive ? 'text-[var(--primary-color)]' : 'text-slate-500';
  const background = isActive ? 'bg-[var(--primary-color)]/10' : '';

  return (
    <button
      onClick={() => onClick(screen)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${color} ${background} cursor-pointer`}
    >
      <Icon name={icon} />
      <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>{label}</span>
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
    if (screen === Screen.Conversation && !currentSession) {
      setScreen(Screen.Welcome);
    } else {
      setScreen(screen);
    }
  };

  if (!isNavVisible) return null;

  return (
    <footer className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 shadow-t-sm">
      <nav className="flex justify-around p-2">
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