import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/soundManager';

export const SoundToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(sound.isEnabled());
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setEnabled(sound.isEnabled());
  }, []);

  const handleToggle = () => {
    const newState = sound.toggle();
    setEnabled(newState);
    if (newState) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 800);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 py-2 px-3.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer group shadow-2xl ${
        enabled
          ? 'bg-neutral-900/90 border-[#BBCCD7]/40 text-[#D7E2EA] hover:border-white'
          : 'bg-neutral-950/80 border-white/10 text-[#D7E2EA]/50 hover:text-white'
      }`}
      aria-label={enabled ? 'Mute interaction sounds' : 'Enable interaction sounds'}
      title={enabled ? 'Sound FX On (Click to mute)' : 'Sound FX Off (Click to unmute)'}
    >
      <div className="relative flex items-center justify-center">
        {enabled ? (
          <Volume2 size={16} className="text-[#BBCCD7] group-hover:text-white transition-colors" />
        ) : (
          <VolumeX size={16} className="text-[#D7E2EA]/40 group-hover:text-[#D7E2EA]/70 transition-colors" />
        )}
      </div>

      {/* Label and animated equalizer bars */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider select-none">
        <span>{enabled ? 'SFX On' : 'SFX Off'}</span>
        {enabled && (
          <div className="flex items-center gap-[2px] h-3">
            <span
              className={`w-[2px] bg-gradient-to-t from-[#BBCCD7] to-[#B600A8] rounded-full ${
                animating ? 'h-3 animate-pulse' : 'h-1.5'
              } transition-all duration-200`}
            />
            <span
              className={`w-[2px] bg-gradient-to-t from-[#BBCCD7] to-[#B600A8] rounded-full ${
                animating ? 'h-3 animate-pulse delay-75' : 'h-2.5'
              } transition-all duration-200`}
            />
            <span
              className={`w-[2px] bg-gradient-to-t from-[#BBCCD7] to-[#B600A8] rounded-full ${
                animating ? 'h-3 animate-pulse delay-150' : 'h-1'
              } transition-all duration-200`}
            />
          </div>
        )}
      </div>
    </button>
  );
};
