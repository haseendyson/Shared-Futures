"use client";

export function ConsentStep({
  introAndConsent,
  onAccept,
}: {
  introAndConsent: string;
  onAccept: () => void;
}) {
  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Before we begin
      </p>
      <div
        className="prose-consent whitespace-pre-wrap font-body text-[15px] leading-relaxed"
        style={{ color: "var(--color-ink-muted)" }}
      >
        {renderMarkdownish(introAndConsent)}
      </div>
      <button
        onClick={onAccept}
        className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
      >
        I accept
        <span aria-hidden>&rarr;</span>
      </button>
    </div>
  );
}

/** Very small subset of markdown -> JSX: headings (##), bold (**text**), paragraphs. */
function renderMarkdownish(text: string) {
  const blocks = text.trim().split(/\n\s*\n/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="font-[family-name:var(--font-display)] text-2xl mt-6 mb-2 first:mt-0"
          style={{ color: "var(--color-ink)" }}
        >
          {block.replace(/^##\s*/, "")}
        </h2>
      );
    }
    const parts = block.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-3">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} style={{ color: "var(--color-ink)" }}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}
