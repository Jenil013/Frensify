import React, { useEffect } from "react";
import { AlertCircle, Lock, Sparkles, X } from "lucide-react";
import type { UsageLimitBlock } from "../utils/usageLimits";

interface UsageLimitModalProps {
  open: boolean;
  block: UsageLimitBlock | null;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function UsageLimitModal({
  open,
  block,
  onClose,
  onUpgrade,
}: UsageLimitModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || !block) return null;

  const isTierLocked = block.reason === "tier_locked";
  const Icon = isTierLocked ? Lock : AlertCircle;
  const iconBg = isTierLocked
    ? "bg-[#FDF3E7] border-[#FCE1CA]"
    : "bg-[#FDF2F4] border-[#F5D0D6]";
  const iconColor = isTierLocked ? "text-[#9A5013]" : "text-[#B83E5C]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="usage-limit-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/35 backdrop-blur-[3px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E9E9E7] px-7 pt-7 pb-6 animate-fade-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7A7A78] hover:bg-[#F1F1EF] hover:text-[#37352F] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        <h2
          id="usage-limit-title"
          className="text-base font-bold text-[#37352F] tracking-tight pr-6"
        >
          {block.title}
        </h2>

        <p className="text-sm text-[#5F5E5B] leading-relaxed mt-2.5">
          {block.message}
        </p>

        {block.reason === "weekly_exhausted" && (
          <div className="mt-4 flex items-start gap-2 text-xs text-[#37352F] bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-3">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A53] shrink-0 mt-0.5" />
            <p>
              You can still practice reading and listening, or return Monday when
              your AI evaluation allowance refreshes.
            </p>
          </div>
        )}

        {block.reason === "weekly_mock_exhausted" && (
          <div className="mt-4 flex items-start gap-2 text-xs text-[#37352F] bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-3">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A53] shrink-0 mt-0.5" />
            <p>
              You can still run skill practice modules, or return Monday when your
              full simulation allowance refreshes.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-[#E9E9E7] text-[#37352F] text-xs font-bold rounded-xl hover:bg-[#FAFAF9] transition-colors cursor-pointer"
          >
            Got it
          </button>
          {block.showUpgrade && onUpgrade && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="px-4 py-2.5 bg-[#2D6A53] hover:bg-[#245642] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              View plans
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
