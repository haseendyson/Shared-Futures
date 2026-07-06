"use client";

import { useState } from "react";

function renderScenarioMarkdown(text: string) {
  return text.split("\n\n").map((block, i) => {
    if (block.startsWith("**") && block.endsWith("**")) {
      return (
        <p key={i} className="font-semibold mb-2" style={{ color: "var(--color-teal-deep)" }}>
          {block.slice(2, -2)}
        </p>
      );
    }
    if (block.startsWith("*") && block.endsWith("*")) {
      return (
        <p key={i} className="italic text-sm mb-1" style={{ color: "var(--color-ink-muted)" }}>
          {block.slice(1, -1)}
        </p>
      );
    }
    return (
      <p key={i} className="mb-2">
        {block}
      </p>
    );
  });
}

export function RateStep({
  scenarioText,
  onContinue,
}: {
  scenarioText: string;
  onContinue: (rating: number) => void;
}) {
  const [rating, setRating] = useState(5);

  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Rate this scenario
      </p>
      <div
        className="rounded-xl p-5 mb-6 text-[14px] leading-relaxed whitespace-pre-wrap"
        style={{ background: "var(--color-paper)", border: "1px solid var(--color-ink-faint)" }}
      >
        {renderScenarioMarkdown(scenarioText)}
      </div>

      <p
        className="font-[family-name:var(--font-display)] italic text-xl mb-2"
        style={{ color: "var(--color-ink)" }}
      >
        How close is this to what I want to say?
      </p>
      <div className="flex justify-between text-sm mb-3">
        <span style={{ color: "var(--color-error)" }}>needs a lot of work</span>
        <span style={{ color: "var(--color-sage)" }}>this looks good</span>
      </div>

      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full accent-[var(--color-teal)]"
      />
      <div
        className="text-center font-mono text-sm mt-1 mb-6"
        style={{ color: "var(--color-ink-muted)" }}
      >
        {rating} / 10
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onContinue(rating)}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-medium text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
