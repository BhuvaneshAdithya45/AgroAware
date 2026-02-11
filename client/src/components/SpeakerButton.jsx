// client/src/components/SpeakerButton.jsx
import { useState, useEffect } from 'react';
import { speakText, stopSpeech, isSpeaking, isSpeechSupported, getAvailableVoices } from '../lib/tts';

export default function SpeakerButton({ text, language = 'en', size = 'md', showLabel = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported] = useState(isSpeechSupported());

  // Don't hide button - just let it try to speak
  // Different browsers have different voices available
  if (!isSupported) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const success = speakText(text, language, () => {
        setIsPlaying(false);
      });
      
      if (!success) {
        setIsPlaying(false);
      }
    }
  };

  // Size mappings
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]}
        flex items-center gap-2 rounded-lg
        ${isPlaying
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700'
        }
        transition-all duration-200 cursor-pointer
        active:scale-95 font-medium
      `}
      title={isPlaying ? 'Stop' : 'Listen in ' + language.toUpperCase()}
      aria-label={isPlaying ? 'Stop speaking' : 'Listen'}
    >
      {/* Icon with animation */}
      <span className={`inline-block ${iconSize[size]} ${isPlaying ? 'animate-pulse' : ''}`}>
        {isPlaying ? (
          // Stop icon
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="4" width="12" height="12" />
          </svg>
        ) : (
          // Speaker/Play icon
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        )}
      </span>

      {/* Label (optional) */}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isPlaying ? '◼' : '▶'} {language.toUpperCase()}
        </span>
      )}
    </button>
  );
}
