"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/chatTypes";

type Phase = "detecting" | "summarising" | "generating" | "done" | "error";

export function ScenarioGenerationStep({
  study,
  personasCount,
  messages,
  onComplete,
}: {
  study: string;
  personasCount: number;
  messages: ChatMessage[];
  onComplete: (
    scenarios: string[],
    summaryAnswers: Record<string, string>,
    languageLevel: string
  ) => void;
}) {
  const [phase, setPhase] = useState<Phase>("detecting");
  const [completedCount, setCompletedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        setPhase("detecting");
        const levelRes = await fetch("/api/language-level", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ study, messages }),
        });
        const { languageLevel } = await levelRes.json();

        setPhase("summarising");
        const summaryRes = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ study, messages }),
        });
        const summaryData = await summaryRes.json();
        if (!summaryRes.ok) {
          setError(summaryData.error ?? "Unable to summarise your story.");
          setPhase("error");
          return;
        }
        const summaryAnswers: Record<string, string> = summaryData.summaryAnswers;

        setPhase("generating");
        const count = Math.min(3, Math.max(1, personasCount || 3));
        const scenarios: string[] = new Array(count).fill("");

        await Promise.all(
          Array.from({ length: count }, (_, index) =>
            fetch("/api/scenario", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ study, personaIndex: index, summaryAnswers, languageLevel }),
            })
              .then((res) => res.json())
              .then((data) => {
                scenarios[data.index] = data.text;
                setCompletedCount((c) => c + 1);
              })
              .catch(() => {
                scenarios[index] = "Sorry, something went wrong while generating this scenario.";
                setCompletedCount((c) => c + 1);
              })
          )
        );

        setPhase("done");
        onComplete(scenarios, summaryAnswers, languageLevel);
      } catch {
        setError("Something went wrong while processing your story. Please try again.");
        setPhase("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = Math.min(3, Math.max(1, personasCount || 3));
  const progressPct = phase === "generating" ? (completedCount / total) * 100 : 0;

  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Summarising your story
      </p>

      <div
        className="rounded-2xl px-4 py-3 mb-6 inline-block max-w-full"
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-ink-faint)",
          color: "var(--color-ink)",
        }}
      >
        Seems I have everything! Let me try to summarise what you said in three scenarios. See if
        you like any of these!
      </div>

      {error ? (
        <p className="text-sm" style={{ color: "var(--color-error)" }} role="alert">
          {error}
        </p>
      ) : (
        <div className="space-y-3">
          <StepRow label="Understanding how you write" done={phase !== "detecting"} />
          <StepRow
            label="Summarising your answers"
            done={phase === "generating" || phase === "done"}
            active={phase === "summarising"}
          />
          <StepRow
            label={
              phase === "generating"
                ? `Processing scenario ${completedCount} of ${total}`
                : "Writing your scenarios"
            }
            done={phase === "done"}
            active={phase === "generating"}
          />

          {phase === "generating" && (
            <div
              className="mt-2 h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-ink-faint)", opacity: 0.9 }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: "var(--color-teal)",
                  transition: "width 400ms ease",
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepRow({ label, done, active }: { label: string; done: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[14px]">
      <span
        className="inline-flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 18,
          height: 18,
          background: done ? "var(--color-teal)" : "transparent",
          border: `1.5px solid ${done ? "var(--color-teal)" : "var(--color-ink-faint)"}`,
        }}
      >
        {done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="var(--color-paper-raised)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span style={{ color: done || active ? "var(--color-ink)" : "var(--color-ink-faint)" }}>
        {label}
      </span>
    </div>
  );
}
