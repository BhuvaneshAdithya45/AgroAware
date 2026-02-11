// client/src/lib/tts.js
// Text-to-Speech utility using browser's Web Speech API

// Check if browser supports SpeechSynthesis
const synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;

let currentUtterance = null;

/**
 * Map language codes to browser voice language names
 */
const LANGUAGE_MAP = {
  en: 'en-US',      // English (US)
  hi: 'hi-IN',      // Hindi (India)
  kn: 'kn-IN',      // Kannada (India)
  te: 'te-IN',      // Telugu (India)
  ta: 'ta-IN',      // Tamil (India)
};

/**
 * Get available voices for a language
 * Falls back to English if language not available
 */
function getVoiceForLanguage(language) {
  if (!synth) return null;

  const targetLang = LANGUAGE_MAP[language] || LANGUAGE_MAP.en;
  const voices = synth.getVoices();

  if (!voices || voices.length === 0) {
    console.warn('No voices available');
    return null;
  }

  // Log available voices for debugging (first time only)
  if (!window._voicesLogged) {
    console.log('Available voices:', voices.map(v => ({ lang: v.lang, name: v.name })));
    window._voicesLogged = true;
  }

  // First try exact match (e.g., hi-IN, kn-IN, te-IN)
  let voice = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase());

  // If no exact match, try language code prefix (e.g., hi, kn, te)
  if (!voice) {
    const langCode = targetLang.split('-')[0];
    voice = voices.find(v => v.lang.toLowerCase().startsWith(langCode));
  }

  // Try any Indian voice if language not found
  if (!voice && ['hi', 'kn', 'te', 'ta'].includes(language)) {
    voice = voices.find(v => v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('india'));
  }

  // Fallback to English if language not found
  if (!voice) {
    console.warn(`No voice found for ${language}, falling back to English`);
    voice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  }

  return voice || voices[0]; // Last resort: first available voice
};

/**
 * Speak text in specified language
 * @param {string} text - Text to speak
 * @param {string} language - Language code (en, hi, kn, te)
 * @param {function} onEnd - Callback when speech ends
 * @returns {boolean} - True if speech started successfully
 */
export function speakText(text, language = 'en', onEnd = null) {
  if (!synth || !text.trim()) return false;

  // Stop any ongoing speech
  stopSpeech();

  // Ensure voices are loaded
  if (synth.getVoices().length === 0) {
    // Voices might not be loaded yet, try again after a short delay
    setTimeout(() => {
      speakText(text, language, onEnd);
    }, 100);
    return true;
  }

  const voice = getVoiceForLanguage(language);
  if (!voice) {
    console.error(`No voice available for language: ${language}`);
    return false;
  }

  // Create utterance
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.voice = voice;
  currentUtterance.lang = LANGUAGE_MAP[language] || LANGUAGE_MAP.en;
  currentUtterance.rate = 1.0; // Normal speed
  currentUtterance.pitch = 1.0;
  currentUtterance.volume = 1.0;

  console.log(`Speaking in ${language} with voice: ${voice.name || 'default'}`);

  // Handle end of speech
  currentUtterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  // Start speaking
  synth.speak(currentUtterance);
  return true;
}

/**
 * Get all available voices for debugging
 */
export function getAvailableVoices() {
  if (!synth) return [];
  return synth.getVoices();
}

/**
 * Check if a language has voice support
 */
export function hasVoiceSupport(language) {
  const voice = getVoiceForLanguage(language);
  return voice !== null;
}

/**
 * Stop current speech
 */
export function stopSpeech() {
  if (!synth) return;

  synth.cancel();
  currentUtterance = null;
}

/**
 * Check if currently speaking
 * @returns {boolean}
 */
export function isSpeaking() {
  return synth && synth.speaking;
}

/**
 * Check if browser supports speech synthesis
 * @returns {boolean}
 */
export function isSpeechSupported() {
  return !!synth;
}

/**
 * React Hook for TTS
 */
export function useVoice() {
  const [isSpeakingState, setIsSpeaking] = React.useState(false);
  const [isSupported] = React.useState(isSpeechSupported());

  const speak = React.useCallback((text, language = 'en') => {
    if (isSpeechSupported()) {
      setIsSpeaking(true);
      speakText(text, language, () => {
        setIsSpeaking(false);
      });
    }
  }, []);

  const stop = React.useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking: isSpeakingState,
    isSupported,
  };
}
