"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/chatTypes";

const QUESTIONS_OUTRO = "Great, I think I got all I need -- but let me double check!";

export function ChatStep({
  study,
  previousScenario,
  onFinished,
}: {
  study: string;
  previousScenario: string | null;
  onFinished: (messages: ChatMessage[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingIntro, setLoadingIntro] = useState(true);
  const [introError, setIntroError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversation/intro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ study, previousScenario }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setIntroError(data.error ?? "Unable to start the conversation.");
          return;
        }
        setMessages([{ role: "ai", content: data.introText }]);
      } catch {
        if (!cancelled) setIntroError("Couldn't reach the server. Please refresh and try again.");
      } finally {
        if (!cancelled) setLoadingIntro(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending || finished) return;

    const priorHistory = messages;
    const humanMessage: ChatMessage = { role: "human", content: trimmed };
    setMessages((prev) => [...prev, humanMessage]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ study, history: priorHistory, input: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.finished) {
        setFinished(true);
        // The raw "FINISHED" marker is never shown to the participant --
        // the outro message takes its place, matching conversation.py.
        setMessages((prev) => [...prev, { role: "ai", content: QUESTIONS_OUTRO }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="animate-[fadeIn_400ms_ease] flex flex-col">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Collecting your story
      </p>

      {introError ? (
        <p className="text-sm" style={{ color: "var(--color-error)" }} role="alert">
          {introError}
        </p>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex flex-col gap-4 overflow-y-auto pr-1"
            style={{ maxHeight: "50vh", minHeight: "220px" }}
          >
            {loadingIntro && <TypingBubble />}
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
            {sending && <TypingBubble />}
          </div>

          {error && (
            <p className="mt-3 text-sm" style={{ color: "var(--color-error)" }} role="alert">
              {error}
            </p>
          )}

          {finished ? (
            <button
              onClick={() => onFinished(messages)}
              className="mt-6 self-start inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
            >
              I&rsquo;m ready — show me!
              <span aria-hidden>&rarr;</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
              <input
                type="text"
                value={input}
                disabled={loadingIntro || sending}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer…"
                className="flex-1 rounded-full px-5 py-3 text-[15px] outline-none transition-shadow"
                style={{
                  background: "var(--color-paper)",
                  border: "1.5px solid var(--color-ink-faint)",
                  color: "var(--color-ink)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-teal)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-ink-faint)")}
              />
              <button
                type="submit"
                disabled={!input.trim() || loadingIntro || sending}
                className="rounded-full px-5 py-3 font-medium text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
              >
                Send
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isHuman = message.role === "human";
  return (
    <div className={`flex ${isHuman ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
        style={
          isHuman
            ? { background: "var(--color-teal)", color: "var(--color-paper-raised)" }
            : {
                background: "var(--color-paper)",
                color: "var(--color-ink)",
                border: "1px solid var(--color-ink-faint)",
              }
        }
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className="rounded-2xl px-4 py-3 flex gap-1 items-center"
        style={{ background: "var(--color-paper)", border: "1px solid var(--color-ink-faint)" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "var(--color-ink-faint)",
              animation: `typing-bounce 1.1s ${i * 0.15}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
