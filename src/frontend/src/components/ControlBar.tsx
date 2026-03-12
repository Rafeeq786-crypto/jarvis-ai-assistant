import { Globe, Mic, MicOff, Send, Trash2 } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import type { JarvisState } from "../hooks/useJarvis";

interface ControlBarProps {
  jarvisState: JarvisState;
  onSend: (text: string) => void;
  onToggleMic: () => void;
  onClearHistory: () => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedLang: string;
  onLangChange: (lang: string) => void;
  interimTranscript: string;
  isSpeechRecognitionSupported: boolean;
}

function getUniqueLanguages(
  voices: SpeechSynthesisVoice[],
): { code: string; label: string }[] {
  const seen = new Set<string>();
  const langs: { code: string; label: string }[] = [];
  for (const v of voices) {
    const code = v.lang;
    if (!seen.has(code)) {
      seen.add(code);
      try {
        const label =
          new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
        langs.push({ code, label });
      } catch {
        langs.push({ code, label: code });
      }
    }
  }
  return langs.sort((a, b) => a.label.localeCompare(b.label));
}

export function ControlBar({
  jarvisState,
  onSend,
  onToggleMic,
  onClearHistory,
  availableVoices,
  selectedLang,
  onLangChange,
  interimTranscript,
  isSpeechRecognitionSupported,
}: ControlBarProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isListening = jarvisState === "listening";
  const isBusy = jarvisState === "thinking" || jarvisState === "speaking";

  const handleSend = () => {
    const text = inputValue.trim() || interimTranscript.trim();
    if (!text || isBusy) return;
    onSend(text);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const langs = getUniqueLanguages(availableVoices);

  return (
    <div className="hud-panel hud-panel-inner p-3 flex flex-col gap-2">
      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Mic button */}
        {isSpeechRecognitionSupported && (
          <button
            type="button"
            onClick={onToggleMic}
            disabled={isBusy}
            className={`glow-btn flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm transition-all ${
              isListening ? "glow-btn-active" : ""
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={isListening ? "Stop listening" : "Start voice input"}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            data-ocid="voice.toggle"
          >
            {isListening ? (
              <MicOff size={16} className="text-primary" />
            ) : (
              <Mic size={16} className="text-primary" />
            )}
          </button>
        )}

        {/* Text input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={
              isListening && interimTranscript ? interimTranscript : inputValue
            }
            onChange={(e) => !isListening && setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening..."
                : isBusy
                  ? "Processing..."
                  : "Transmit message..."
            }
            disabled={isBusy}
            className="jarvis-input w-full h-10 px-3 text-sm rounded-sm outline-none"
            data-ocid="chat.input"
            aria-label="Message input"
          />
          {isListening && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary status-dot-fast" />
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isBusy || (!inputValue.trim() && !interimTranscript.trim())}
          className="glow-btn flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
          title="Send message"
          aria-label="Send message"
          data-ocid="chat.submit_button"
        >
          <Send size={15} className="text-primary" />
        </button>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Language selector */}
        <div className="flex items-center gap-1.5 flex-1">
          <Globe size={12} className="text-primary/50" />
          {langs.length > 0 ? (
            <select
              value={selectedLang}
              onChange={(e) => onLangChange(e.target.value)}
              className="jarvis-select flex-1 min-w-0 h-7 px-1.5 rounded-sm text-[11px] outline-none"
              data-ocid="lang.select"
              aria-label="Select language"
            >
              {langs.map((l) => (
                <option
                  key={l.code}
                  value={l.code}
                  style={{ background: "#0a0e1a" }}
                >
                  {l.label} ({l.code})
                </option>
              ))}
            </select>
          ) : (
            <span className="hud-text text-[10px] text-primary/30 tracking-wider">
              {selectedLang.toUpperCase()}
            </span>
          )}
        </div>

        {/* Clear history */}
        <button
          type="button"
          onClick={onClearHistory}
          className="glow-btn flex-shrink-0 flex items-center gap-1.5 h-7 px-2 rounded-sm text-[10px] hud-text tracking-wider text-destructive border-destructive/40 bg-destructive/5 hover:bg-destructive/15"
          title="Clear conversation history"
          aria-label="Clear history"
          data-ocid="history.delete_button"
        >
          <Trash2 size={11} />
          <span>CLEAR</span>
        </button>
      </div>
    </div>
  );
}
