import { useCallback, useEffect, useRef, useState } from "react";
import { type Message, Role } from "../backend.d";
import { generateResponse, getGreeting } from "../responseEngine";
import { useActor } from "./useActor";
import { useSpeech } from "./useSpeech";

export type JarvisState = "idle" | "listening" | "thinking" | "speaking";

export interface UseJarvisReturn {
  jarvisState: JarvisState;
  messages: Message[];
  isLoading: boolean;
  handleUserInput: (text: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  cancelSpeech: () => void;
  clearHistory: () => Promise<void>;
  availableVoices: SpeechSynthesisVoice[];
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  interimTranscript: string;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
}

export function useJarvis(): UseJarvisReturn {
  const [jarvisState, setJarvisState] = useState<JarvisState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasGreeted = useRef(false);
  const jarvisStateRef = useRef<JarvisState>("idle");

  const speech = useSpeech();
  const { actor, isFetching } = useActor();
  const speechRef = useRef(speech);
  speechRef.current = speech;

  // Keep ref in sync with state
  useEffect(() => {
    jarvisStateRef.current = jarvisState;
  }, [jarvisState]);

  // Sync jarvis state with speech state
  useEffect(() => {
    if (speech.speechState === "listening") {
      setJarvisState("listening");
    } else if (speech.speechState === "speaking") {
      setJarvisState("speaking");
    } else if (jarvisStateRef.current !== "thinking") {
      setJarvisState("idle");
    }
  }, [speech.speechState]);

  // Load messages on mount
  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getMessages()
      .then((msgs) => {
        setMessages(msgs);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
    // biome-ignore lint/correctness/useExhaustiveDependencies: load once when actor ready
  }, [actor, isFetching]);

  // Speak greeting on first load
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once when loading completes
  useEffect(() => {
    if (!isLoading && !hasGreeted.current && actor) {
      hasGreeted.current = true;
      const sp = speechRef.current;
      const greeting = getGreeting(sp.selectedLang);
      setMessages((prev) => {
        if (prev.length === 0) {
          const greetingMsg: Message = {
            content: greeting,
            role: Role.assistant,
            timestamp: BigInt(Date.now()),
          };
          actor.addMessage(Role.assistant, greeting).catch(() => {});
          setTimeout(() => {
            speechRef.current.speak(greeting, sp.selectedLang);
          }, 800);
          return [greetingMsg];
        }
        return prev;
      });
    }
  }, [isLoading, actor]);

  const handleUserInput = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const sp = speechRef.current;
      const currentActor = actor;

      const userMsg: Message = {
        content: text.trim(),
        role: Role.user,
        timestamp: BigInt(Date.now()),
      };

      setMessages((prev) => [...prev, userMsg]);
      setJarvisState("thinking");
      jarvisStateRef.current = "thinking";

      currentActor?.addMessage(Role.user, text.trim()).catch(() => {});

      const delay = 800 + Math.random() * 400;
      await new Promise((res) => setTimeout(res, delay));

      const response = generateResponse(text, sp.selectedLang);

      const assistantMsg: Message = {
        content: response,
        role: Role.assistant,
        timestamp: BigInt(Date.now()),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setJarvisState("speaking");
      jarvisStateRef.current = "speaking";

      currentActor?.addMessage(Role.assistant, response).catch(() => {});
      sp.speak(response, sp.selectedLang);
    },
    [actor],
  );

  // Handle transcript from speech recognition
  const prevTranscriptRef = useRef("");
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally use ref for state check
  useEffect(() => {
    const t = speech.transcript;
    if (
      t &&
      t !== prevTranscriptRef.current &&
      jarvisStateRef.current !== "thinking" &&
      jarvisStateRef.current !== "speaking"
    ) {
      prevTranscriptRef.current = t;
      handleUserInput(t);
    }
  }, [speech.transcript, handleUserInput]);

  const clearHistory = useCallback(async () => {
    await actor?.clearHistory();
    setMessages([]);
    speechRef.current.cancelSpeech();
    setJarvisState("idle");
    jarvisStateRef.current = "idle";
  }, [actor]);

  return {
    jarvisState,
    messages,
    isLoading,
    handleUserInput,
    startListening: speech.startListening,
    stopListening: speech.stopListening,
    cancelSpeech: speech.cancelSpeech,
    clearHistory,
    availableVoices: speech.availableVoices,
    selectedLang: speech.selectedLang,
    setSelectedLang: speech.setSelectedLang,
    interimTranscript: speech.interimTranscript,
    isSpeechRecognitionSupported: speech.isSpeechRecognitionSupported,
    isSpeechSynthesisSupported: speech.isSpeechSynthesisSupported,
  };
}
