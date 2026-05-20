import React from "react";
import { Headphones, FileSearch, MessageCircle, PenLine } from "lucide-react";
import {
  TEF_CEFR_DESCRIPTOR_GRID,
  TEF_CEFR_LEVELS,
  TEF_SKILLS,
  CefrLevel,
  CEFR_LEVEL_COLORS,
  TefSkillId,
} from "../../tefConstants";

const SKILL_ICONS: Record<TefSkillId, React.ReactNode> = {
  "comprehension-orale": <Headphones className="w-4 h-4" />,
  "comprehension-ecrite": <FileSearch className="w-4 h-4" />,
  "expression-orale": <MessageCircle className="w-4 h-4" />,
  "expression-ecrite": <PenLine className="w-4 h-4" />,
};

interface TefGradingSchemeProps {
  highlightLevel?: CefrLevel;
  compact?: boolean;
}

export default function TefGradingScheme({
  highlightLevel,
  compact = false,
}: TefGradingSchemeProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
            TEF · CECR competency grid
          </p>
          <p className="text-[11px] text-[#5F5E5B] mt-0.5">
            Official descriptors by level and skill (Compréhension / Expression).
          </p>
        </div>
        {highlightLevel && (
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${CEFR_LEVEL_COLORS[highlightLevel].bg} ${CEFR_LEVEL_COLORS[highlightLevel].text}`}
          >
            Your target: {highlightLevel}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E9E9E7] bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#FAFAF9] border-b border-[#E9E9E7]">
              <th className="w-16 p-2.5 text-[9px] font-bold uppercase text-[#7A7A78]">
                Niveau
              </th>
              {TEF_SKILLS.map((skill) => (
                <th
                  key={skill.id}
                  className="p-2.5 text-[9px] font-bold uppercase text-[#7A7A78] align-bottom"
                >
                  <div className="flex items-center gap-1.5 text-[#37352F]">
                    <span className="text-[#1D74B4]">{SKILL_ICONS[skill.id]}</span>
                    <span className="leading-tight">
                      {compact ? skill.labelEn.split(" ")[0] : skill.labelFr}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEF_CEFR_LEVELS.map((level, rowIdx) => {
              const colors = CEFR_LEVEL_COLORS[level];
              const isHighlight = highlightLevel === level;
              return (
                <tr
                  key={level}
                  className={`border-b border-[#F1F1EF] last:border-0 ${
                    rowIdx % 2 === 0 ? "bg-white" : "bg-[#FAFAF9]/80"
                  } ${isHighlight ? "ring-2 ring-inset ring-[#1A73E8]/40" : ""}`}
                >
                  <td className="p-0 align-middle">
                    <div
                      className={`mx-1 my-1.5 flex items-center justify-center min-h-[52px] rounded-md ${colors.arrow} text-white font-extrabold text-sm tracking-wide`}
                    >
                      {level}
                    </div>
                  </td>
                  {TEF_SKILLS.map((skill) => (
                    <td
                      key={skill.id}
                      className={`p-2.5 align-top text-[#5F5E5B] leading-relaxed ${
                        isHighlight ? "bg-[#EBF3FC]/30" : ""
                      }`}
                    >
                      {TEF_CEFR_DESCRIPTOR_GRID[level][skill.id]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
