import React from "react";
import {
  TEF_SAMPLE_ATTESTATION,
  TEF_CEFR_SKILL_TARGETS,
  CefrLevel,
  getSkillLabel,
  scoreToBand,
} from "../../tefConstants";

interface TefScoreEquivalenceTableProps {
  targetCefr?: CefrLevel;
  showSample?: boolean;
}

export default function TefScoreEquivalenceTable({
  targetCefr = "B2",
  showSample = true,
}: TefScoreEquivalenceTableProps) {
  const targets = TEF_CEFR_SKILL_TARGETS[targetCefr];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
          TEF Canada · Score / 699 equivalences
        </p>
        <p className="text-[11px] text-[#5F5E5B] mt-0.5">
          Each épreuve maps to <strong className="text-[#37352F]">Niveau CECR</strong> and{" "}
          <strong className="text-[#37352F]">Niveau NCLC</strong> (IRCC chart).
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E9E9E7] bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#37352F] text-white">
              <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">
                Épreuve
              </th>
              <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">
                Score / 699
              </th>
              <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider hidden sm:table-cell">
                Ancien score
              </th>
              <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">
                CECR
              </th>
              <th className="p-2.5 font-bold text-[9px] uppercase tracking-wider">
                NCLC
              </th>
            </tr>
          </thead>
          <tbody>
            {(showSample ? TEF_SAMPLE_ATTESTATION : []).map((row, i) => {
              const band = scoreToBand(row.skillId, row.score);
              return (
                <tr
                  key={row.skillId}
                  className={`border-b border-[#F1F1EF] ${
                    i % 2 === 0 ? "bg-white" : "bg-[#FAFAF9]"
                  }`}
                >
                  <td className="p-2.5 font-semibold text-[#37352F]">
                    {getSkillLabel(row.skillId)}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-[#1D74B4]">
                    {row.score}
                  </td>
                  <td className="p-2.5 font-mono text-[#7A7A78] hidden sm:table-cell">
                    {row.oldScore}
                  </td>
                  <td className="p-2.5">
                    <span className="font-bold text-[#37352F]">{row.cefr}</span>
                    {band && band.cefr !== row.cefr && (
                      <span className="text-[9px] text-[#7A7A78] ml-1">
                        (grid: {band.cefr})
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#EAF5F1] text-[#2D6A53] font-bold text-[10px]">
                      NCLC{row.nclc}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-[#D2E7F6] bg-[#EBF3FC]/50 p-3.5">
        <p className="text-[10px] font-bold uppercase text-[#1D74B4] tracking-wider mb-2">
          Minimum scores for target {targetCefr}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {Object.entries(targets).map(([skillId, t]) => (
            <div
              key={skillId}
              className="flex justify-between items-center bg-white/80 rounded-md px-2.5 py-1.5 border border-[#E9E9E7]"
            >
              <span className="text-[#5F5E5B] truncate pr-2">
                {getSkillLabel(skillId as keyof typeof targets)}
              </span>
              <span className="font-mono font-bold text-[#37352F] shrink-0">
                ≥{t.scoreMin}{" "}
                <span className="text-[#2D6A53] text-[10px]">NCLC{t.nclc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
