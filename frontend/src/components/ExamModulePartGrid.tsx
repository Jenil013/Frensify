import React from "react";
import { BookOpen, Headphones, Mic, PenTool } from "lucide-react";
import type { ExamModuleCard } from "../lib/examModuleBreakdown";
import type { TefModuleId } from "../types";

const MODULE_CARD_THEME: Record<
  TefModuleId,
  { bg: string; border: string; icon: string; text: string; detail: string }
> = {
  "comprehension-orale": {
    bg: "bg-[#F5FAF8]",
    border: "border-[#D1EBE1]",
    icon: "text-[#2D6A53]",
    text: "text-[#2D6A53]",
    detail: "text-[#3D6B58]",
  },
  "comprehension-ecrite": {
    bg: "bg-[#FDF8F3]",
    border: "border-[#FCE1CA]",
    icon: "text-[#9A5013]",
    text: "text-[#9A5013]",
    detail: "text-[#7A4010]",
  },
  "expression-ecrite": {
    bg: "bg-[#F5F9FD]",
    border: "border-[#D2E7F6]",
    icon: "text-[#1D74B4]",
    text: "text-[#1D74B4]",
    detail: "text-[#155A8F]",
  },
  "expression-orale": {
    bg: "bg-[#FDF6F8]",
    border: "border-[#F8D4DE]",
    icon: "text-[#B83E5C]",
    text: "text-[#B83E5C]",
    detail: "text-[#8F3149]",
  },
};

const MODULE_ICONS: Record<TefModuleId, React.ElementType> = {
  "comprehension-orale": Headphones,
  "comprehension-ecrite": BookOpen,
  "expression-orale": Mic,
  "expression-ecrite": PenTool,
};

interface ExamModulePartGridProps {
  cards: ExamModuleCard[];
}

export default function ExamModulePartGrid({ cards }: ExamModulePartGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const theme = MODULE_CARD_THEME[card.moduleId];
        const Icon = MODULE_ICONS[card.moduleId];

        return (
          <div
            key={card.moduleId}
            className={`min-h-[11.5rem] sm:min-h-[12.5rem] rounded-xl border shadow-sm flex flex-col items-center justify-between px-2.5 py-4 text-center ${theme.bg} ${theme.border}`}
          >
            <div className="flex flex-col items-center">
              <Icon className={`w-9 h-9 mb-2 ${theme.icon}`} strokeWidth={1.75} />
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.12em] ${theme.text}`}
              >
                Part {card.part}
              </span>
              <div
                className={`mt-1.5 text-sm font-semibold leading-tight ${theme.text}`}
              >
                <div>{card.line1}</div>
                <div>{card.line2}</div>
              </div>
            </div>
            <div
              className={`mt-3 space-y-0.5 text-[10px] sm:text-[11px] leading-snug font-medium ${theme.detail}`}
            >
              {card.detail.split(" / ").map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
