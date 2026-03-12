import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechState = "idle" | "listening" | "speaking";

// Manual declarations for Web Speech API (not always in TS DOM lib)
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

// Augment window for webkit speech recognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export interface UseSpeechReturn {
  speechState: SpeechState;
  transcript: string;
  interimTranscript: string;
  availableVoices: SpeechSynthesisVoice[];
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, lang: string) => void;
  cancelSpeech: () => void;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedLang, setSelectedLang] = useState(
    () => navigator.language || "en-US",
  );

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const isSpeechSynthesisSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Load voices
  useEffect(() => {
    if (!isSpeechSynthesisSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    const timer = setTimeout(loadVoices, 500);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSpeechSynthesisSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setSpeechState("idle");
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported) return;

    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setSpeechState("listening");
      setTranscript("");
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      setSpeechState("idle");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setSpeechState("idle");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSpeechRecognitionSupported, isSpeechSynthesisSupported, selectedLang]);

  const cancelSpeech = useCallback(() => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeechState("idle");
  }, [isSpeechSynthesisSupported]);

  const speak = useCallback(
    (text: string, lang: string) => {
      if (!isSpeechSynthesisSupported) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.92;
      utterance.pitch = 0.85;
      utterance.volume = 1;

      const langCode = lang.split("-")[0].toLowerCase();
      const voices = window.speechSynthesis.getVoices();

      let voice = voices.find(
        (v) => v.lang.toLowerCase() === lang.toLowerCase(),
      );
      if (!voice)
        voice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode));
      if (!voice)
        voice = voices.find(
          (v) => v.lang.toLowerCase().startsWith(langCode) && !v.localService,
        );

      if (voice) utterance.voice = voice;

      utterance.onstart = () => setSpeechState("speaking");
      utterance.onend = () => setSpeechState("idle");
      utterance.onerror = () => setSpeechState("idle");

      setSpeechState("speaking");
      window.speechSynthesis.speak(utterance);
    },
    [isSpeechSynthesisSupported],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    };
  }, [isSpeechSynthesisSupported]);

  return {
    speechState,
    transcript,
    interimTranscript,
    availableVoices,
    selectedLang,
    setSelectedLang,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
  };
}
