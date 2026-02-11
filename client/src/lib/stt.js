// Speech-to-Text (STT) Utility Library
// Uses Web Speech API for voice input with multilingual support

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

// Language mapping for speech recognition
const languageMap = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
};

/**
 * Initialize speech recognition
 */
const initSpeechRecognition = () => {
  if (!SpeechRecognition) {
    console.warn('Speech Recognition API not supported in this browser');
    return null;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
  }

  return recognition;
};

/**
 * Start listening for voice input
 * @param {string} language - Language code (en, hi, kn, te)
 * @param {function} onResult - Callback with interim results: {transcript, isFinal}
 * @param {function} onError - Callback with error
 * @param {function} onEnd - Callback when listening ends
 */
export const startListening = (language = 'en', onResult, onError, onEnd) => {
  const rec = initSpeechRecognition();

  if (!rec) {
    console.error('Speech Recognition not available');
    return;
  }

  isListening = true;
  const lang = languageMap[language] || 'en-US';

  rec.language = lang;

  // Handle results
  rec.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        transcript: finalTranscript || interimTranscript,
        isFinal: finalTranscript.length > 0,
      });
    }
  };

  // Handle errors
  rec.onerror = (event) => {
    if (onError) {
      onError(event.error);
    }
  };

  // Handle end of listening
  rec.onend = () => {
    isListening = false;
    if (onEnd) {
      onEnd();
    }
  };

  try {
    rec.start();
  } catch (e) {
    console.error('Error starting speech recognition:', e);
  }
};

/**
 * Stop listening
 */
export const stopListening = () => {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
};

/**
 * Check if currently listening
 */
export const isCurrentlyListening = () => {
  return isListening;
};

/**
 * Check if Speech Recognition API is supported
 */
export const isSpeechRecognitionSupported = () => {
  return !!SpeechRecognition;
};

/**
 * React Hook for Speech-to-Text
 */
export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState(null);

  const startListeningHook = React.useCallback((language = 'en') => {
    setTranscript('');
    setError(null);
    setIsListening(true);

    startListening(
      language,
      ({ transcript: t, isFinal }) => {
        setTranscript(t);
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  }, []);

  const stopListeningHook = React.useCallback(() => {
    stopListening();
    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening: startListeningHook,
    stopListening: stopListeningHook,
  };
};
