import { useState, useRef, useEffect } from 'react';
import { useTranslation } from "../i18n";
import { useTheme } from "../components/ThemeProvider";
import Navbar from "../components/Navbar";

export default function Voice() {
  const { t, lang } = useTranslation();
  const { dark } = useTheme();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Map app lang code to browser locale
  const LOCALE_MAP = {
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
    te: 'te-IN',
    ta: 'ta-IN'
  };

  const currentLocale = LOCALE_MAP[lang] || 'en-US';

  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    if (isSupported) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = currentLocale;

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        setTranscript(text);

        if (result.isFinal) {
          handleQuery(text);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      synthesisRef.current.cancel();
    };
  }, [isSupported, currentLocale]); // Re-init if language changes

  const startListening = () => {
    setError('');
    setTranscript('');
    setResponse('');
    setIsListening(true);
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLocale; // Ensure updated lang
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const handleQuery = async (query) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Use the existing chat API which handles RAG + Schemes + Translation
      // We send 'language' param so backend replies in that language
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/advisory/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, language: lang }),
      });

      const data = await res.json();
      const reply = data.answer || data.message || t("error_msg", "I could not understand.");
      setResponse(reply);
      speak(reply);
    } catch (_err) {
      const errorMsg = t("error_msg", "Sorry, I could not connect to the server.");
      setError(errorMsg);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text) => {
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLocale;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthesisRef.current.cancel();
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("voice_browser_unsupported", "Browser Not Supported")}</h2>
          <p className="text-gray-600">
            {t("voice_browser_msg", "Voice features require Chrome, Edge, or Safari. Please switch to a supported browser.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🎤 {t("voice_title", "Voice Assistant")}</h1>
          <p className="text-gray-600">{t("voice_subtitle", "Ask me anything about farming, crops, or agriculture!")}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Microphone Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`relative w-32 h-32 rounded-full transition-all duration-300 transform hover:scale-105 ${isListening
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-300'
                : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-5xl text-white">
                {isLoading ? '⏳' : isListening ? '⏹️' : '🎤'}
              </span>
              {isListening && (
                <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
              )}
            </button>
          </div>

          <p className="text-center text-gray-500 mb-6">
            {isListening ? t("voice_listening", "Listening... Speak now!") : isLoading ? t("voice_processing", "Processing...") : t("voice_tap_to_start", "Tap the microphone to start")}
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">{t("voice_you_said", "You said:")}</p>
              <p className="text-lg text-gray-800 font-medium">"{transcript}"</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-green-600">{t("voice_response", "Response:")}</p>
                <button
                  onClick={isSpeaking ? stopSpeaking : () => speak(response)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? '🔇' : '🔊'}
                </button>
              </div>
              <p className="text-gray-800 leading-relaxed">{response}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 mt-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-3">💡 {t("voice_try_asking", "Try asking:")}</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              "{t("voice_q1", "What crops should I grow in Karnataka during summer?")}"
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              "{t("voice_q2", "How much fertilizer does rice need?")}"
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              "{t("voice_q3", "What is the best time to plant wheat?")}"
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              "{t("voice_q4", "Tell me about government schemes for farmers")}"
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}