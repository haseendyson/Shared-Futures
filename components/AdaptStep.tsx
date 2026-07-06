"use client";

import { useState } from "react";

interface AdaptMessage {
  role: "human" | "ai";
  content: string;
}

export function AdaptStep({
  study,
  languageLevel,
  originalScenarioText,
  initialScenarioText,
  onConfirm,
}: {
  study: string;
  languageLevel: string;
  originalScenarioText: string;
  initialScenarioText: string;
  onConfirm: (finalText: string) => void;
}) {
  const [editorText, setEditorText] = useState(initialScenarioText);
  const [adaptMessages, setAdaptMessages] = useState<AdaptMessage[]>([
    { role: "ai", content: "Okay, what's missing or could change to make this better?" },
  ]);
  const [adaptedScenario, setAdaptedScenario] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);

  function handleReset() {
    setEditorText(originalScenarioText);
    setAdaptMessages([
      { role: "ai", content: "Okay, what's missing or could change to make this better?" },
    ]);
    setAdaptedScenario(null);
    setChatInput("");
  }

  function handleRejectAdaptation() {
    setAdaptedScenario(null);
    setAdaptMessages([
      { role: "ai", content: "Okay, what's missing or could change to make this better?" },
    ]);
  }

  function handleAcceptAdaptation() {
    if (adaptedScenario) setEditorText(adaptedScenario);
    setAdaptedScenario(null);
    setAdaptMessages([
      { role: "ai", content: "Okay, what's missing or could change to make this better?" },
    ]);
  }

  async function handleAdaptSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || sending) return;

    setAdaptMessages((prev) => [...prev, { role: "human", content: trimmed }]);
    setChatInput("");
    setSending(true);

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ study, scenario: editorText, input: trimmed, languageLevel }),
      });
      const data = await res.json();
      setAdaptedScenario(data.newScenario);
    } catch {
      setAdaptedScenario(
        "Sorry, something went wrong while adapting the scenario. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Shape your final story
      </p>
      <p className="text-[15px] mb-6" style={{ color: "var(--color-ink-muted)" }}>
        It seems that you selected a story that you liked. You can either edit this below, or ask
        the AI to adapt it for you.
      </p>

      <h3
        className="font-[family-name:var(--font-display)] text-lg mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        Adapt yourself
      </h3>
      <textarea
        value={editorText}
        onChange={(e) => setEditorText(e.target.value)}
        rows={9}
        className="w-full rounded-lg p-4 text-[14px] leading-relaxed outline-none resize-y"
        style={{
          background: "var(--color-paper)",
          border: "1.5px solid var(--color-ink-faint)",
          color: "var(--color-ink)",
        }}
      />

      <div className="flex gap-3 mt-4 justify-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
          style={{
            background: "transparent",
            border: "1.5px solid var(--color-ink-faint)",
            color: "var(--color-ink-muted)",
          }}
        >
          ↩️ Reset to original
        </button>
        <button
          onClick={() => onConfirm(editorText)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
        >
          I&rsquo;m happy with this!
        </button>
      </div>

      <div
        className="mt-8 rounded-xl p-5"
        style={{ background: "var(--color-paper)", border: "1px solid var(--color-ink-faint)" }}
      >
        <h3
          className="font-[family-name:var(--font-display)] text-lg mb-4"
          style={{ color: "var(--color-ink)" }}
        >
          Adapt with AI
        </h3>

        {adaptedScenario ? (
          <div>
            <div
              className="rounded-2xl px-4 py-3 mb-4"
              style={{
                background: "var(--color-paper-raised)",
                border: "1px solid var(--color-ink-faint)",
              }}
            >
              <p className="text-[14px] mb-2" style={{ color: "var(--color-ink)" }}>
                Here is the adaptation:
              </p>
              <p
                className="text-[14px] leading-relaxed whitespace-pre-wrap italic"
                style={{ color: "var(--color-amber)" }}
              >
                {adaptedScenario}
              </p>
              <p className="font-semibold mt-3 text-[14px]" style={{ color: "var(--color-ink)" }}>
                What do you think?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectAdaptation}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-medium"
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--color-ink-faint)",
                  color: "var(--color-ink-muted)",
                }}
              >
                ↩️ Nope, let&rsquo;s try again
              </button>
              <button
                onClick={handleAcceptAdaptation}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-medium"
                style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
              >
                ✅ Yes, use this version
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-4">
              {adaptMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "human" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap"
                    style={
                      m.role === "human"
                        ? { background: "var(--color-teal)", color: "var(--color-paper-raised)" }
                        : {
                            background: "var(--color-paper-raised)",
                            color: "var(--color-ink)",
                            border: "1px solid var(--color-ink-faint)",
                          }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-2.5 text-[14px]"
                    style={{
                      background: "var(--color-paper-raised)",
                      border: "1px solid var(--color-ink-faint)",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    Working on your updated scenario…
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleAdaptSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                disabled={sending}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe what you'd like to change…"
                className="flex-1 rounded-full px-4 py-2.5 text-[14px] outline-none"
                style={{
                  background: "var(--color-paper-raised)",
                  border: "1.5px solid var(--color-ink-faint)",
                  color: "var(--color-ink)",
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || sending}
                className="rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
                style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
