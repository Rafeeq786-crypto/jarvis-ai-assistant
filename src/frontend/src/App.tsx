import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { ControlBar } from "./components/ControlBar";
import { OrbVisualizer } from "./components/OrbVisualizer";
import { useJarvis } from "./hooks/useJarvis";

function getStatusText(state: string, isListening: boolean): string {
  if (isListening) return "LISTENING...";
  if (state === "thinking") return "PROCESSING...";
  if (state === "speaking") return "SPEAKING...";
  return "READY";
}

export default function App() {
  const jarvis = useJarvis();
  const [micActive, setMicActive] = useState(false);

  const statusText = getStatusText(
    jarvis.jarvisState,
    jarvis.jarvisState === "listening",
  );

  const handleToggleMic = () => {
    if (micActive) {
      jarvis.stopListening();
      setMicActive(false);
    } else {
      jarvis.startListening();
      setMicActive(true);
    }
  };

  // Keep micActive in sync with actual state
  if (!micActive && jarvis.jarvisState === "listening") setMicActive(true);
  if (micActive && jarvis.jarvisState !== "listening") setMicActive(false);

  return (
    <div
      className="hud-grid scanlines relative flex flex-col h-screen w-screen overflow-hidden bg-background"
      data-ocid="app.section"
    >
      <Toaster />

      {/* === HUD HEADER === */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 border-b border-primary/15 bg-background/80 backdrop-blur-sm">
        {/* Left indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400/70 status-dot" />
            <span className="hud-text text-[10px] text-foreground/40 tracking-widest">
              SYS ONLINE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/70 status-dot-fast" />
            <span className="hud-text text-[10px] text-foreground/40 tracking-widest">
              AI CORE
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <h1 className="jarvis-title text-base md:text-xl font-bold tracking-[0.5em]">
            J.A.R.V.I.S
          </h1>
          <span className="hud-text text-[8px] text-primary/40 tracking-[0.3em] mt-0.5">
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </span>
        </div>

        {/* Right indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            <span className="hud-text text-[10px] text-foreground/40 tracking-widest">
              NEURAL
            </span>
            <div className="w-2 h-2 rounded-full bg-primary/50 status-dot" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hud-text text-[10px] text-foreground/40 tracking-widest">
              VOICE
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                jarvis.isSpeechSynthesisSupported
                  ? "bg-primary/70"
                  : "bg-foreground/20"
              } status-dot`}
            />
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden gap-0">
        {/* === ORB SECTION (Left on desktop, top on mobile) === */}
        <section
          className="flex flex-col items-center justify-center md:w-[55%] py-4 md:py-0 px-4 flex-shrink-0 relative"
          aria-label="JARVIS Orb Visualizer"
        >
          {/* Decorative corner brackets for orb section */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30" />
          <div className="absolute bottom-16 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30" />
          <div className="absolute bottom-16 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30" />

          {/* Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer ring decoration */}
            <div
              className="absolute rounded-full border border-primary/10"
              style={{ width: 320, height: 320 }}
            />
            <div
              className="absolute rounded-full border border-primary/5"
              style={{ width: 360, height: 360 }}
            />
            <OrbVisualizer state={jarvis.jarvisState} />
          </div>

          {/* Status */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/20 bg-primary/5"
              data-ocid="status.panel"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  jarvis.jarvisState === "idle"
                    ? "bg-primary/40 status-dot"
                    : jarvis.jarvisState === "listening"
                      ? "bg-green-400 status-dot-fast"
                      : jarvis.jarvisState === "thinking"
                        ? "bg-yellow-400/70 status-dot-fast"
                        : "bg-primary status-dot-fast"
                }`}
              />
              <span className="hud-text text-xs tracking-[0.3em] text-primary/80">
                {statusText}
              </span>
            </div>

            {/* Interim transcript display */}
            {jarvis.interimTranscript && (
              <p className="hud-text text-[11px] text-primary/50 mt-1 italic tracking-wide max-w-[240px] text-center truncate">
                "{jarvis.interimTranscript}"
              </p>
            )}
          </div>

          {/* Horizontal HUD lines */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex flex-col gap-px pointer-events-none">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          </div>
        </section>

        {/* === CHAT PANEL (Right on desktop, below on mobile) === */}
        <aside
          className="flex-1 flex flex-col overflow-hidden md:border-l border-primary/10 px-2 md:px-3 pb-2 pt-0 md:py-3"
          aria-label="Communication log"
        >
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={jarvis.messages}
              isLoading={jarvis.isLoading}
              status={statusText}
            />
          </div>
        </aside>
      </main>

      {/* === CONTROL BAR === */}
      <footer className="relative z-10 px-2 md:px-4 pb-3 pt-2 border-t border-primary/10">
        <ControlBar
          jarvisState={jarvis.jarvisState}
          onSend={jarvis.handleUserInput}
          onToggleMic={handleToggleMic}
          onClearHistory={jarvis.clearHistory}
          availableVoices={jarvis.availableVoices}
          selectedLang={jarvis.selectedLang}
          onLangChange={jarvis.setSelectedLang}
          interimTranscript={jarvis.interimTranscript}
          isSpeechRecognitionSupported={jarvis.isSpeechRecognitionSupported}
        />
      </footer>

      {/* Footer branding */}
      <div className="relative z-10 flex justify-center py-1 border-t border-primary/5">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hud-text text-[9px] text-foreground/20 hover:text-foreground/40 transition-colors tracking-widest"
        >
          © {new Date().getFullYear()} · BUILT WITH LOVE USING CAFFEINE.AI
        </a>
      </div>
    </div>
  );
}
