"use client";

export interface ThreadStep {
  key: string;
  label: string;
}

export function StoryThread({
  steps,
  currentIndex,
}: {
  steps: ThreadStep[];
  currentIndex: number;
}) {
  return (
    <nav
      aria-label="Progress through the story"
      className="hidden md:block shrink-0 w-48 pt-2"
    >
      <ol className="relative">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <li key={step.key} className="relative pl-7 pb-9 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-[18px] bottom-0 w-px"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-ink-faint) 60%, transparent 0%)",
                    backgroundSize: "1px 6px",
                    backgroundRepeat: "repeat-y",
                    opacity: done ? 0 : 1,
                  }}
                />
              )}
              {!isLast && done && (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-[18px] bottom-0 w-px"
                  style={{ background: "var(--color-teal)" }}
                />
              )}
              <span
                aria-hidden
                className="absolute left-0 top-[3px] flex items-center justify-center"
              >
                {active && (
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 22,
                      height: 22,
                      background: "var(--color-amber)",
                      opacity: 0.2,
                      left: -4,
                      top: -4,
                      animation: "pulse-ring 2.2s ease-in-out infinite",
                    }}
                  />
                )}
                <span
                  className="block rounded-full"
                  style={{
                    width: 14,
                    height: 14,
                    background: done || active ? "var(--color-teal)" : "var(--color-paper)",
                    border: `1.5px solid ${done || active ? "var(--color-teal)" : "var(--color-ink-faint)"}`,
                  }}
                />
              </span>
              <span
                className="font-mono text-[11px] tracking-wide uppercase block leading-[14px]"
                style={{
                  color: active
                    ? "var(--color-ink)"
                    : done
                      ? "var(--color-teal)"
                      : "var(--color-ink-faint)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.22; }
          50% { transform: scale(1.35); opacity: 0.08; }
        }
      `}</style>
    </nav>
  );
}
