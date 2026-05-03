/**
 * MessageInput — enhanced chat input with character count and keyboard hints.
 * Enter to send, Shift+Enter for newline. Auto-grows up to 5 lines.
 */

"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MAX_CHARS = 4000;

export function MessageInput({ onSend, isLoading, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;

  return (
    <div
      data-testid="message-input-container"
      className="border-t border-slate-200 bg-white px-4 py-3"
    >
      <div
        className={`flex items-end gap-2 rounded-xl border bg-slate-50 px-3 py-2 transition-all ${
          overLimit
            ? "border-red-400 ring-1 ring-red-400"
            : "border-slate-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        }`}
      >
        <textarea
          ref={textareaRef}
          data-testid="message-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Message AI Assistant…"
          disabled={disabled || isLoading}
          rows={1}
          maxLength={MAX_CHARS + 100}
          className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50"
          aria-label="Message input"
        />
        <button
          data-testid="send-button"
          onClick={handleSend}
          disabled={!value.trim() || isLoading || disabled || overLimit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Footer row */}
      <div className="mt-1.5 flex items-center justify-between px-1">
        <p className="text-[11px] text-slate-400">
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 text-[10px] font-mono">Enter</kbd>
          {" "}to send ·{" "}
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 text-[10px] font-mono">Shift+Enter</kbd>
          {" "}for newline
        </p>
        {nearLimit && (
          <span className={`text-[11px] ${overLimit ? "text-red-500 font-medium" : "text-slate-400"}`}>
            {charCount}/{MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}
