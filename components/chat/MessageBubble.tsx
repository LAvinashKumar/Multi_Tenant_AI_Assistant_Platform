/**
 * MessageBubble — renders a single chat message with enhanced UI.
 * User messages appear on the right, assistant on the left.
 * Supports basic markdown-like rendering (bold, code, line breaks).
 */

import { Bot, User } from "lucide-react";
import { Message } from "@/hooks/useMessages";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Renders text with basic markdown: **bold**, `code`, line breaks */
function renderContent(text: string) {
  return text.split("\n").map((line, lineIdx, lines) => {
    // Split by bold (**text**) and code (`text`)
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <span key={lineIdx}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={i} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.8em]">
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <div
      data-testid={`message-${message._id}`}
      className={`message-enter flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-600 border border-slate-200"
        }`}
        aria-hidden="true"
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`flex max-w-[78%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`message-content rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-blue-600 text-white shadow-sm"
              : "rounded-tl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-100"
          }`}
        >
          {renderContent(message.content)}
        </div>
        <span className="text-[11px] text-slate-400">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

/**
 * Typing indicator shown while AI is generating a response.
 */
export function TypingIndicator() {
  return (
    <div data-testid="typing-indicator" className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-1" aria-label="AI is typing">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot h-2 w-2 rounded-full bg-slate-400"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
