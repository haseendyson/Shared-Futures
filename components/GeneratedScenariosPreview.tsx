"use client";

export interface GeneratedScenariosPreviewProps {
  participantId: string | null;
  scenarios: string[];
  summaryAnswers: Record<string, string>;
}

export function GeneratedScenariosPreview({
  participantId,
  scenarios,
  summaryAnswers,
}: GeneratedScenariosPreviewProps) {
  const idLabel = participantId ? `: ${participantId}` : "";
  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Your scenarios
      </p>
      <h2
        className="font-[family-name:var(--font-display)] text-2xl mb-4"
        style={{ color: "var(--color-ink)" }}
      >
        {scenarios.length} scenario{scenarios.length === 1 ? "" : "s"} ready{idLabel}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-ink-muted)" }}>
        Selection, rating, and adapting come next — for now, here&rsquo;s what got generated from
        your {Object.keys(summaryAnswers).length} summarised answers.
      </p>
      <div className="space-y-4">
        {scenarios.map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-5 whitespace-pre-wrap text-[14px] leading-relaxed"
            style={{
              background: "var(--color-paper)",
              border: "1px solid var(--color-ink-faint)",
              color: "var(--color-ink)",
            }}
          >
            {renderScenarioMarkdown(s)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Renders the **bold title** and *italic metadata lines* produced by scenarioToText. */
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
