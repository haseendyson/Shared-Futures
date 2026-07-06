"use client";

import { useState } from "react";
import { PublicStudyConfig } from "@/lib/publicConfig";
import { StoryThread, ThreadStep } from "@/components/StoryThread";
import { ConsentStep } from "@/components/ConsentStep";
import { ParticipantIdStep } from "@/components/ParticipantIdStep";
import { ChatStep } from "@/components/ChatStep";
import { ScenarioGenerationStep } from "@/components/ScenarioGenerationStep";
import { ReviewStep } from "@/components/ReviewStep";
import { RateStep } from "@/components/RateStep";
import { AdaptStep } from "@/components/AdaptStep";
import { CompletionStep } from "@/components/CompletionStep";
import { ChatMessage } from "@/lib/chatTypes";

type AgentState =
  | "consent"
  | "identify"
  | "collect"
  | "generate"
  | "review"
  | "rate"
  | "adapt"
  | "save";

const THREAD_STEPS: ThreadStep[] = [
  { key: "consent", label: "Consent" },
  { key: "identify", label: "Identify" },
  { key: "collect", label: "Your story" },
  { key: "shape", label: "Shape it" },
  { key: "save", label: "Complete" },
];

// review/rate/adapt all live under the "shape" node in the thread display
const THREAD_INDEX: Record<AgentState, number> = {
  consent: 0,
  identify: 1,
  collect: 2,
  generate: 3,
  review: 3,
  rate: 3,
  adapt: 3,
  save: 4,
};

export function Wizard({ config }: { config: PublicStudyConfig }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [agentState, setAgentState] = useState<AgentState>("consent");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [previousScenario, setPreviousScenario] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [generatedScenarios, setGeneratedScenarios] = useState<string[]>([]);
  const [summaryAnswers, setSummaryAnswers] = useState<Record<string, string>>({});
  const [languageLevel, setLanguageLevel] = useState("intermediate");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [initialReviewScore, setInitialReviewScore] = useState<number | null>(null);
  const [finalScenario, setFinalScenario] = useState("");

  function handleConsent() {
    if (config.requireParticipantId) {
      setAgentState("identify");
    } else {
      setParticipantId((id) => id ?? crypto.randomUUID());
      setAgentState("collect");
    }
  }

  function handleParticipantConfirmed(id: string, prevScenario: string | null) {
    setParticipantId(id);
    setPreviousScenario(prevScenario);
    setAgentState("collect");
  }

  function handleConversationFinished(messages: ChatMessage[]) {
    setConversationMessages(messages);
    setAgentState("generate");
  }

  function handleGenerationComplete(
    scenarios: string[],
    summary: Record<string, string>,
    level: string
  ) {
    setGeneratedScenarios(scenarios);
    setSummaryAnswers(summary);
    setLanguageLevel(level);
    if (scenarios.length === 1) {
      setSelectedIndex(0);
      setAgentState("rate");
    } else {
      setAgentState("review");
    }
  }

  function handleSelectScenario(index: number) {
    setSelectedIndex(index);
    setAgentState("rate");
  }

  function handleRated(rating: number) {
    const text = selectedIndex !== null ? generatedScenarios[selectedIndex] : "";
    setFinalScenario(text);
    setInitialReviewScore(rating);
    setAgentState(rating === 10 ? "save" : "adapt");
  }

  function handleAdaptConfirmed(text: string) {
    setFinalScenario(text);
    setAgentState("save");
  }

  const originalScenarioText = selectedIndex !== null ? generatedScenarios[selectedIndex] : "";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b" style={{ borderColor: "var(--color-ink-faint)" }}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <span
            className="font-[family-name:var(--font-display)] text-lg tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            MicrON
          </span>
          <span
            className="font-mono text-[11px] tracking-wide uppercase"
            style={{ color: "var(--color-ink-faint)" }}
          >
            {config.studyName.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex gap-12">
        <StoryThread steps={THREAD_STEPS} currentIndex={THREAD_INDEX[agentState]} />

        <div className="flex-1 min-w-0 relative">
          <div
            aria-hidden
            className="paper-texture absolute -inset-6 rounded-2xl pointer-events-none"
          />
          <div
            className="relative rounded-2xl p-8 sm:p-10"
            style={{
              background: "var(--color-paper-raised)",
              boxShadow: "0 1px 2px rgba(31,42,36,0.06), 0 8px 24px rgba(31,42,36,0.05)",
            }}
          >
            {agentState === "consent" && (
              <ConsentStep introAndConsent={config.introAndConsent} onAccept={handleConsent} />
            )}

            {agentState === "identify" && (
              <ParticipantIdStep
                helperText={config.participantCollectionText}
                editable={config.editableParticipantId}
                previousRequired={config.requirePreviousFinalScenario}
                onConfirmed={handleParticipantConfirmed}
              />
            )}

            {agentState === "collect" && (
              <ChatStep
                study={config.studyName}
                previousScenario={previousScenario}
                onFinished={handleConversationFinished}
              />
            )}

            {agentState === "generate" && (
              <ScenarioGenerationStep
                study={config.studyName}
                personasCount={config.personasCount}
                messages={conversationMessages}
                onComplete={handleGenerationComplete}
              />
            )}

            {agentState === "review" && (
              <ReviewStep scenarios={generatedScenarios} onSelect={handleSelectScenario} />
            )}

            {agentState === "rate" && (
              <RateStep scenarioText={originalScenarioText} onContinue={handleRated} />
            )}

            {agentState === "adapt" && (
              <AdaptStep
                study={config.studyName}
                languageLevel={languageLevel}
                originalScenarioText={originalScenarioText}
                initialScenarioText={finalScenario || originalScenarioText}
                onConfirm={handleAdaptConfirmed}
              />
            )}

            {agentState === "save" && (
              <CompletionStep
                sessionId={sessionId}
                participantId={participantId}
                languageLevel={languageLevel}
                initialScenario={originalScenarioText}
                initialReviewScore={initialReviewScore}
                finalScenario={finalScenario}
                summaryAnswers={summaryAnswers}
                generatedScenarios={generatedScenarios}
                conversationMessages={conversationMessages}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
