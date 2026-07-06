"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, formatHistory } from "@/lib/chatTypes";

function formatCompletionTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function CompletionStep({
  sessionId,
  participantId,
  languageLevel,
  initialScenario,
  initialReviewScore,
  finalScenario,
  summaryAnswers,
  generatedScenarios,
  conversationMessages,
}: {
  sessionId: string;
  participantId: string | null;
  languageLevel: string;
  initialScenario: string;
  initialReviewScore: number | null;
  finalScenario: string;
  summaryAnswers: Record<string, string>;
  generatedScenarios: string[];
  conversationMessages: ChatMessage[];
}) {
  const [status, setStatus] = useState<"saving" | "saved" | "unsaved">("saving");
  const saved = useRef(false);

  const sessionPackage = {
    session_id: sessionId,
    participant_id: participantId ?? sessionId,
    langsmith_session_id: "",
    completion_time: formatCompletionTime(new Date()),
    language_level: languageLevel,
    initial_scenario: initialScenario,
    initial_scenario_review_score: initialReviewScore,
    final_scenario: finalScenario,
    summary_answers: summaryAnswers,
    scenarios: generatedScenarios.map((text) => ({ text, feedback: null, judgement: null })),
    chat_history: conversationMessages.map((m) => ({ role: m.role, message: m.content })),
    chat_history_single_string: formatHistory(conversationMessages),
  };

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    (async () => {
      try {
        const res = await fetch("/api/finalise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package: sessionPackage }),
        });
        const data = await res.json();
        setStatus(data.saved ? "saved" : "unsaved");
      } catch {
        setStatus("unsaved");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDownload() {
    const json = JSON.stringify(sessionPackage, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "micron_interaction_history.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        {status === "saving" ? "Saving your story…" : "Complete"}
      </p>
      <h2
        className="font-[family-name:var(--font-display)] text-3xl mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        🎉 Yay! 🎉
      </h2>
      <p className="text-[15px] mb-6" style={{ color: "var(--color-ink-muted)" }}>
        You&rsquo;ve now completed the interaction and hopefully found a scenario that you liked!
      </p>

      <div
        className="rounded-xl p-5 whitespace-pre-wrap text-[15px] leading-relaxed mb-6"
        style={{
          background: "var(--color-paper)",
          border: `1.5px solid var(--color-sage)`,
          color: "var(--color-teal-deep)",
        }}
      >
        {finalScenario}
      </div>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
      >
        ⬇ Download interaction history as JSON
      </button>

      {status === "unsaved" && (
        <p className="mt-4 text-sm" style={{ color: "var(--color-ink-faint)" }}>
          (Your data wasn&rsquo;t saved to the study database, but you can still download it
          above.)
        </p>
      )}
    </div>
  );
}
