// LanguageSelector.tsx
import React from 'react';
import { Language, LANGUAGES } from '../../types';
import { Icon } from '../components/Icon';

export const LanguageSelector: React.FC<{
  value: Language;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ value, onChange }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="appearance-none w-full bg-white border border-gray-300 text-[var(--text-primary)] py-4 pl-5 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-lg cursor-pointer"
    >
      {LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
      <Icon name="expand_more" />
    </div>
  </div>
);