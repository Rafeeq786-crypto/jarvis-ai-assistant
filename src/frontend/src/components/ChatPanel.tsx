import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import type { Message } from "../backend.d";
import { Role } from "../backend.d";

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  status: string;
}

function formatTime(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatPanel({ messages, isLoading, status }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages array changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="hud-panel hud-panel-inner flex flex-col h-full"
      data-ocid="chat.panel"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary status-dot" />
          <span className="hud-text text-xs font-bold tracking-[0.3em] text-primary">
            COMMUNICATION LOG
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hud-text text-[10px] text-primary/50">SYS</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400/70 status-dot-fast" />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="px-4 py-1.5 bg-primary/5 border-b border-primary/10 flex items-center gap-2"
        data-ocid="status.panel"
      >
        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
        <span className="hud-text text-[10px] text-primary/70 tracking-widest">
          {status}
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-3" data-ocid="chat.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  i % 2 === 0 ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-7 h-7 rounded-sm bg-primary/10 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-primary/10 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-primary/10 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 gap-2"
            data-ocid="chat.empty_state"
          >
            <div className="w-8 h-8 border border-primary/30 rounded-sm flex items-center justify-center">
              <span className="hud-text text-primary/40 text-xs">J</span>
            </div>
            <p className="hud-text text-[11px] text-primary/30 tracking-widest">
              AWAITING TRANSMISSION
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={`${String(msg.timestamp)}-${idx}`}
                className={`flex items-end gap-2 message-in ${
                  msg.role === Role.user ? "flex-row-reverse" : ""
                }`}
                data-ocid={`chat.item.${idx + 1}`}
              >
                {/* Avatar */}
                {msg.role === Role.assistant && (
                  <div className="w-7 h-7 shrink-0 rounded-sm border border-primary/40 bg-primary/10 flex items-center justify-center mb-1">
                    <span className="hud-text text-primary text-xs font-bold">
                      J
                    </span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-sm px-3 py-2 ${
                    msg.role === Role.user
                      ? "bg-primary/15 border border-primary/30 text-right ml-auto"
                      : "bg-secondary/10 border border-secondary/20"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed ${
                      msg.role === Role.user
                        ? "text-foreground/90"
                        : "text-foreground/85"
                    }`}
                  >
                    {msg.content}
                  </p>
                  <span className="hud-text text-[9px] text-foreground/30 mt-1 block">
                    {msg.role === Role.assistant ? "JARVIS · " : "USER · "}
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* User indicator */}
                {msg.role === Role.user && (
                  <div className="w-7 h-7 shrink-0 rounded-sm border border-foreground/20 bg-foreground/5 flex items-center justify-center mb-1">
                    <span className="hud-text text-foreground/40 text-xs font-bold">
                      U
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}
