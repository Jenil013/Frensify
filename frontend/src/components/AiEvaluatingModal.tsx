import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const WAITING_MESSAGES = [
  "Hang tight, your results are on their way!",
  "We're putting the final touches on your results…",
  "Almost there, your results are coming up!",
  "Working behind the scenes to bring your results...",
  "Analyzing your answers… results coming soon.",
] as const;

const GHOST_LINE_WIDTHS = [42, 96, 88, 94, 72, 86, 58, 91, 38];

function pickWaitingMessage(): string {
  return WAITING_MESSAGES[
    Math.floor(Math.random() * WAITING_MESSAGES.length)
  ];
}

function DocumentSkeleton() {
  return (
    <div className="relative w-40 h-48 mx-auto mb-6">
      <div className="absolute inset-0 rounded-2xl border border-[#D1EBE1] bg-gradient-to-br from-[#FAFAF9] to-[#F4F8F6] shadow-[0_4px_24px_rgba(45,106,83,0.08)] overflow-hidden">
        {/* Folded corner */}
        <div className="absolute top-0 right-0 w-9 h-9 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[36px] border-t-[#EAF5F1] border-l-[36px] border-l-transparent" />
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[37px] border-t-[#D1EBE1] border-l-[37px] border-l-transparent opacity-80" />
        </div>

        <div className="px-4 pt-6 pb-4 space-y-2.5">
          {GHOST_LINE_WIDTHS.map((width, index) => (
            <div
              key={index}
              className="h-2 rounded-full skeleton-ghost-line"
              style={{
                width: `${width}%`,
                animationDelay: `${index * 120}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Soft glow beneath document */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-3 rounded-full bg-[#2D6A53]/10 blur-md"
        aria-hidden
      />
    </div>
  );
}

interface AiEvaluatingModalProps {
  open: boolean;
  title?: string;
  message?: string;
  error?: string | null;
  onDismissError?: () => void;
}

export default function AiEvaluatingModal({
  open,
  title = "Preparing your results",
  message,
  error = null,
  onDismissError,
}: AiEvaluatingModalProps) {
  const [waitingMessage, setWaitingMessage] = useState(WAITING_MESSAGES[0]);

  useEffect(() => {
    if (open) {
      setWaitingMessage(message ?? pickWaitingMessage());
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open, message]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-evaluating-title"
      aria-busy={!error}
    >
      <div className="absolute inset-0 bg-[#37352F]/35 backdrop-blur-[3px]" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E9E9E7] px-8 pt-8 pb-7 text-center animate-fade-in overflow-hidden">
        {!error && (
          <div
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#EAF5F1]/60 to-transparent pointer-events-none"
            aria-hidden
          />
        )}

        {error ? (
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FDF2F4] border border-[#F5D0D6] flex items-center justify-center mb-5">
            <Sparkles className="w-6 h-6 text-[#B83E5C]" />
          </div>
        ) : (
          <DocumentSkeleton />
        )}

        <h2
          id="ai-evaluating-title"
          className="text-base font-bold text-[#37352F] tracking-tight relative"
        >
          {error ? "Evaluation could not finish" : title}
        </h2>

        <p className="text-sm text-[#5F5E5B] leading-relaxed mt-2.5 max-w-xs mx-auto relative">
          {error ?? waitingMessage}
        </p>

        {error && onDismissError ? (
          <button
            type="button"
            onClick={onDismissError}
            className="mt-6 px-5 py-2.5 bg-[#37352F] hover:bg-[#2B2A28] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Back to simulations
          </button>
        ) : null}
      </div>
    </div>
  );
}
