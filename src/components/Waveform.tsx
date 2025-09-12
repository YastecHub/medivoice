import React from 'react';

interface WaveformProps {
  stream: MediaStream | null;
}

export const Waveform: React.FC<WaveformProps> = ({ stream }) => {
  // Static SVG to match design
  return (
    <svg height="60" preserveAspectRatio="none" viewBox="0 0 500 60" width="100%">
      <path d="M0 30 C 50 10, 100 50, 150 30 S 250 10, 300 30 S 400 50, 450 30 S 500 10, 500 30" fill="none" stroke="#1193d4" stroke-width="2"></path>
      <path d="M0 30 C 50 40, 100 20, 150 30 S 250 40, 300 30 S 400 20, 450 30 S 500 40, 500 30" fill="none" stroke="#1193d4" stroke-opacity="0.5" stroke-width="1"></path>
    </svg>
  );
};