"use client";

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

export function ReviewStep({
  scenarios,
  onSelect,
}: {
  scenarios: string[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Review your scenarios
      </p>
      <h2
        className="font-[family-name:var(--font-display)] text-2xl mb-2"
        style={{ color: "var(--color-ink)" }}
      >
        Which one feels right?
      </h2>
      <p className="text-[15px] mb-6" style={{ color: "var(--color-ink-muted)" }}>
        Have a look at the scenarios below, then pick the one you like the most to continue.
      </p>

      <div className="space-y-5">
        {scenarios.slice(0, 3).map((text, index) => (
          <div
            key={index}
            className="rounded-xl p-5"
            style={{ background: "var(--color-paper)", border: "1px solid var(--color-ink-faint)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3
                className="font-[family-name:var(--font-display)] text-lg"
                style={{ color: "var(--color-ink)" }}
              >
                Scenario {index + 1}
              </h3>
              <button
                onClick={() => onSelect(index)}
                className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
              >
                Continue with this one 🎉
              </button>
            </div>
            <div
              className="text-[14px] leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--color-ink)" }}
            >
              {renderScenarioMarkdown(text)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
