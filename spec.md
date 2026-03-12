# Jarvis AI Assistant

## Current State
New project with no existing functionality.

## Requested Changes (Diff)

### Add
- Animated circular orb/waveform that reacts to listening, thinking, and speaking states
- Web Speech API integration: SpeechSynthesis (TTS) and SpeechRecognition (STT)
- Multilingual support: auto-detect browser language, use matching synthesis voice
- Text chat interface with message history
- Rule-based AI response engine with intelligent, professional replies
- Professional greeting on load in detected browser language
- Futuristic HUD-style dark UI with glowing blue/cyan accents
- Pulsing/animated states for listening, thinking, speaking
- Language selector for manual override
- Voice input button

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: minimal canister to persist conversation history and settings
2. Frontend:
   - `useJarvis` hook: manages state machine (idle/listening/thinking/speaking)
   - `useSpeech` hook: wraps SpeechRecognition and SpeechSynthesis
   - `OrbVisualizer` component: Canvas-based animated orb with waveform rings
   - `ChatPanel` component: scrollable message history with HUD styling
   - `ControlBar` component: mic button, text input, language selector
   - `responseEngine.ts`: rule-based response logic with multilingual greeting map
   - Dark theme with OKLCH cyan/blue glows, HUD grid lines, scanline overlays
