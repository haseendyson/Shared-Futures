"use client";

import { useState } from "react";

export function ParticipantIdStep({
  helperText,
  editable,
  previousRequired,
  onConfirmed,
}: {
  helperText: string;
  editable: boolean;
  previousRequired: boolean;
  onConfirmed: (participantId: string, previousScenario: string | null) => void;
}) {
  const [participantId, setParticipantId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participantId.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, previousRequired }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      onConfirmed(data.participantId, data.previousScenario ?? null);
    } catch {
      setError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-[fadeIn_400ms_ease]">
      <p className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-teal)] mb-3">
        Participant identification
      </p>
      <h2
        className="font-[family-name:var(--font-display)] text-2xl mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        Who&rsquo;s telling this story?
      </h2>
      {helperText && (
        <p className="text-[15px] mb-6" style={{ color: "var(--color-ink-muted)" }}>
          {helperText}
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-sm">
        <label
          htmlFor="participant-id"
          className="block font-mono text-[11px] tracking-wide uppercase mb-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Participant ID
        </label>
        <input
          id="participant-id"
          type="text"
          value={participantId}
          disabled={!editable || submitting}
          onChange={(e) => setParticipantId(e.target.value)}
          placeholder="e.g. P-0142"
          className="w-full rounded-lg px-4 py-3 font-mono text-[15px] outline-none transition-shadow"
          style={{
            background: "var(--color-paper-raised)",
            border: "1.5px solid var(--color-ink-faint)",
            color: "var(--color-ink)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-teal)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-ink-faint)")}
        />

        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--color-error)" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!participantId.trim() || submitting}
          className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
          style={{ background: "var(--color-teal)", color: "var(--color-paper-raised)" }}
        >
          {submitting ? "Checking…" : "Confirm ID"}
          {!submitting && <span aria-hidden>&rarr;</span>}
        </button>
      </form>
    </div>
  );
}
