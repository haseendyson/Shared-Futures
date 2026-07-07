"use client";

import { useState } from "react";

type Phase = "pre-visit" | "on-visit" | "post-visit";

export interface EchoIntroProps {
  eventName?: string;
  tagline?: string;
  onPhaseSelected?: (phase: Phase) => void;
  onAbout?: () => void;
}

export function EchoIntro({
  eventName = "Great Exhibition Road Festival",
  tagline = "Event Conversations. Heard. Ongoing.",
  onPhaseSelected,
  onAbout,
}: EchoIntroProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase>("on-visit");
  const [showAbout, setShowAbout] = useState(false);

  const handlePhaseSelect = (phase: Phase) => {
    setSelectedPhase(phase);
  };

  const handleNext = () => {
    onPhaseSelected?.(selectedPhase);
  };

  const handleAbout = () => {
    setShowAbout(!showAbout);
    onAbout?.();
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-slate-900 tracking-tight font-display">
          ECHO
        </h1>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 rounded-3xl p-8 text-white shadow-2xl">
          {/* Date and Event Info */}
          <div className="mb-8">
            <p className="text-sm opacity-80 mb-2">{formattedDate}</p>
            <p className="text-lg font-medium mb-3">{eventName} ended</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">D+30</span>
              <span className="text-sm opacity-75">days after</span>
            </div>
          </div>

          <hr className="border-white border-opacity-20 my-6" />

          {/* Phase Selection */}
          <div className="space-y-4 mb-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="phase"
                value="pre-visit"
                checked={selectedPhase === "pre-visit"}
                onChange={() => handlePhaseSelect("pre-visit")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-base font-medium group-hover:opacity-90 transition-opacity">
                Pre-visit
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="phase"
                value="on-visit"
                checked={selectedPhase === "on-visit"}
                onChange={() => handlePhaseSelect("on-visit")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-base font-medium group-hover:opacity-90 transition-opacity">
                On-visit
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="phase"
                value="post-visit"
                checked={selectedPhase === "post-visit"}
                onChange={() => handlePhaseSelect("post-visit")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-base font-medium group-hover:opacity-90 transition-opacity">
                Post-visit
              </span>
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full bg-white text-blue-900 rounded-full py-3 font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group"
          >
            Continue
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* About Button */}
      <button
        onClick={handleAbout}
        className="mt-12 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <span className="text-sm font-medium">About this project</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 16v-4m0-4h.01"
          />
        </svg>
      </button>

      {showAbout && (
        <div className="mt-8 max-w-md bg-white rounded-lg p-6 border border-slate-200 shadow-lg">
          <h3 className="font-semibold text-slate-900 mb-2">About</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Share your experiences from this event.
          </p>
        </div>
      )}
    </div>
  );
}
