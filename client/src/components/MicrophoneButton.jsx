import React from 'react';
import { startListening, stopListening, isCurrentlyListening, isSpeechRecognitionSupported } from '../lib/stt';

/**
 * MicrophoneButton - Voice input for chat messages
 * Shows microphone icon with recording indicator
 */
const MicrophoneButton = ({ language = 'en', onTranscript, disabled = false, size = 'md' }) => {
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState(null);

  const sizeMap = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
  };

  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech Recognition not supported in your browser');
      return;
    }

    setIsListening(true);
    setError(null);

    startListening(
      language,
      ({ transcript, isFinal }) => {
        if (onTranscript && isFinal) {
          onTranscript(transcript);
        }
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  return (
    <button
      onClick={isListening ? handleStopListening : handleStartListening}
      disabled={disabled}
      title={isListening ? 'Stop listening' : 'Click to speak'}
      className={`
        ${sizeMap[size]}
        flex items-center justify-center rounded-full
        transition-all duration-200
        ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-400
      `}
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C10.34 2 9 3.34 9 5v6c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-1.66-1.34-3-3-3zm0 14c-2.76 0-5-2.24-5-5h-2c0 3.88 3.12 7 7 7s7-3.12 7-7h-2c0 2.76-2.24 5-5 5z" />
      </svg>
    </button>
  );
};

export default MicrophoneButton;
