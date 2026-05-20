import React from "react";
import { Timer, X } from "lucide-react";

interface ModuleSessionShellProps {
  title: string;
  objective: string;
  secondsRemaining: number;
  progressLabel?: string;
  currentSection?: "A" | "B" | null;
  sectionLabels?: { A: string; B: string };
  onAbort?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function formatTime(secs: number) {
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

export default function ModuleSessionShell({
  title,
  objective,
  secondsRemaining,
  progressLabel,
  currentSection,
  sectionLabels,
  onAbort,
  children,
  footer,
}: ModuleSessionShellProps) {
  const isLowTime = secondsRemaining <= 60 && secondsRemaining > 0;

  return (
    <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 md:p-6 shadow-premium-xl space-y-5">
      <div className="flex justify-between items-start gap-4 pb-3 border-b border-[#F1F1EF]">
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-bold text-[#37352F]">{title}</h3>
          <p className="text-xs text-[#7A7A78] leading-relaxed">{objective}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {progressLabel && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F5E5B] bg-[#F1F1EF] px-2 py-1 rounded border border-[#E9E9E7]">
              {progressLabel}
            </span>
          )}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              isLowTime
                ? "bg-[#FCECF0] border-[#F8D4DE] text-[#B83E5C]"
                : "bg-[#FDF3E7] border-[#FCE1CA] text-[#9A5013]"
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="font-mono">{formatTime(secondsRemaining)}</span>
          </div>
          {onAbort && (
            <button
              type="button"
              onClick={onAbort}
              className="p-1.5 text-[#7A7A78] hover:text-[#B83E5C] cursor-pointer"
              title="Quit module"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {sectionLabels && currentSection && (
        <div className="flex gap-1 p-1 bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg">
          {(["A", "B"] as const).map((sec) => (
            <div
              key={sec}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs text-center ${
                currentSection === sec
                  ? "bg-white font-bold border border-[#E9E9E7] shadow-sm text-[#37352F]"
                  : "text-[#7B7B79]"
              }`}
            >
              {sectionLabels[sec]}
            </div>
          ))}
        </div>
      )}

      <div>{children}</div>

      {footer && <div className="pt-2 border-t border-[#F1F1EF]">{footer}</div>}
    </div>
  );
}
