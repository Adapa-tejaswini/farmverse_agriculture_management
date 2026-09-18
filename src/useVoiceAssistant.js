import { useEffect, useRef, useState } from "react";

const getSpeechRecognition = () => {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

const cleanTextForSpeech = (text) => {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
};

export const voiceLanguages = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "kn-IN", label: "Kannada" },
  { code: "mr-IN", label: "Marathi" },
  { code: "te-IN", label: "Telugu" },
  { code: "ta-IN", label: "Tamil" },
];

const getBestVoiceFromList = (voices, language) => {
  const targetLanguage = String(language || "en-IN").toLowerCase();
  const languagePrefix = targetLanguage.split("-")[0];

  const exactVoice = voices.find(
    (voice) => voice.lang.toLowerCase() === targetLanguage
  );

  if (exactVoice) return exactVoice;

  const googleExactVoice = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("google") &&
      voice.lang.toLowerCase() === targetLanguage
  );

  if (googleExactVoice) return googleExactVoice;

  const prefixVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(languagePrefix)
  );

  if (prefixVoice) return prefixVoice;

  const googlePrefixVoice = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("google") &&
      voice.lang.toLowerCase().startsWith(languagePrefix)
  );

  if (googlePrefixVoice) return googlePrefixVoice;

  return null;
};

const useVoiceAssistant = () => {
  const recognitionRef = useRef(null);

  const [voices, setVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechSupported =
    typeof window !== "undefined" && Boolean(getSpeechRecognition());

  const ttsSupported =
    typeof window !== "undefined" && Boolean(window.speechSynthesis);

  useEffect(() => {
    if (!ttsSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [ttsSupported]);

  const getBestVoice = (language = "en-IN") => {
    if (!ttsSupported) return null;

    const availableVoices =
      voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    return getBestVoiceFromList(availableVoices, language);
  };

  const isVoiceAvailable = (language = "en-IN") => {
    if (!ttsSupported) return false;

    if (language === "en-IN") return true;

    return Boolean(getBestVoice(language));
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  const startListening = ({
    language = "en-IN",
    onTranscript,
    onFinalTranscript,
    onError,
  }) => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      onError?.("Voice input is not supported in this browser.");
      return;
    }

    stopListening();

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;

      if (currentText) {
        onTranscript?.(currentText.trim());
      }

      if (finalTranscript) {
        onFinalTranscript?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      recognitionRef.current = null;
      onError?.(event.error || "Voice recognition failed.");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeaking = () => {
    if (!ttsSupported) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speak = (text, language = "en-IN") => {
    if (!ttsSupported) return false;

    const cleanedText = cleanTextForSpeech(text);

    if (!cleanedText) return false;

    const selectedVoice = getBestVoice(language);

    if (!selectedVoice && language !== "en-IN") {
      console.warn(`No speech voice available for ${language}`);
      setIsSpeaking(false);
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanedText);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = language;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);

    return true;
  };

  return {
    speechSupported,
    ttsSupported,
    voices,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getBestVoice,
    isVoiceAvailable,
  };
};

export default useVoiceAssistant;