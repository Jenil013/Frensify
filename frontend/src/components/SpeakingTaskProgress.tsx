import React from "react";
import { Check } from "lucide-react";

interface SpeakingTaskProgressProps {
  taskLabels: string[];
  currentIndex: number;
  precheckDone?: boolean;
  sectionSecondsLeft?: number;
}

export default function SpeakingTaskProgress({
  taskLabels,
  currentIndex,
  precheckDone = true,
  sectionSecondsLeft,
}: SpeakingTaskProgressProps) {
  return (
    <div className="border border-[#E9E9E7] rounded-xl bg-white p-4 space-y-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
        Exam progress
      </p>

      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-xs">
          {precheckDone ? (
            <Check className="w-4 h-4 text-[#2D6A53] shrink-0" />
          ) : (
            <span className="w-4 h-4 rounded border border-[#E9E9E7] shrink-0" />
          )}
          <span className={precheckDone ? "text-[#2D6A53] font-medium" : "text-[#7A7A78]"}>
            Greeting / setup
          </span>
        </li>

        {taskLabels.map((label, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${
                isCurrent ? "bg-[#FEF9E7] border border-[#F5E6A8]" : ""
              }`}
            >
              {isDone ? (
                <Check className="w-4 h-4 text-[#2D6A53] shrink-0" />
              ) : (
                <span
                  className={`w-4 h-4 rounded border shrink-0 ${
                    isCurrent ? "border-[#E5C76B]" : "border-[#E9E9E7]"
                  }`}
                />
              )}
              <span
                className={
                  isDone
                    ? "text-[#2D6A53] font-medium"
                    : isCurrent
                      ? "text-[#37352F] font-bold"
                      : "text-[#7A7A78]"
                }
              >
                {label}
              </span>
              {isCurrent && (
                <span className="ml-auto text-[10px] font-bold uppercase text-[#B8860B]">
                  Now
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {sectionSecondsLeft != null && (
        <div className="bg-[#FCECF0] border border-[#F8D4DE] rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase text-[#B83E5C]">Section timer</p>
          <p className="text-lg font-bold text-[#37352F] tabular-nums">
            {Math.floor(sectionSecondsLeft / 60)}:
            {(sectionSecondsLeft % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}
    </div>
  );
}
