import React from "react";
import type { RecentTestItem } from "../lib/apiClient";
import { formatTakenDate, scorePillClass } from "../utils/recentTests";

interface RecentTestsTableProps {
  tests: RecentTestItem[];
  loading?: boolean;
  emptyMessage?: string;
  maxHeightClass?: string;
}

export default function RecentTestsTable({
  tests,
  loading = false,
  emptyMessage = "No tests yet. Complete a practice module or mock simulation to see results here.",
  maxHeightClass = "max-h-72",
}: RecentTestsTableProps) {
  return (
    <div className={`${maxHeightClass} overflow-y-auto overflow-x-auto -mx-1 px-1`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-[#E9E9E7] text-[#9B9A97] font-semibold shadow-[0_1px_0_#E9E9E7]">
            <th className="py-2 px-3 font-normal bg-white">Exam Name</th>
            <th className="py-2 px-3 font-normal bg-white">Date Taken</th>
            <th className="py-2 px-3 font-normal text-right bg-white">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F1EF]">
          {loading ? (
            <tr>
              <td colSpan={3} className="py-6 px-3 text-center text-[#9B9A97]">
                Loading recent activity…
              </td>
            </tr>
          ) : tests.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-6 px-3 text-center text-[#9B9A97]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            tests.map((row) => (
              <tr key={row.id} className="hover:bg-[#FAFAF9] transition-all">
                <td className="py-3 px-3 max-w-[220px]">
                  <p className="font-medium text-[#37352F] truncate">{row.examName}</p>
                  {row.subtitle && (
                    <p className="text-[10px] text-[#9B9A97] truncate mt-0.5">
                      {row.subtitle}
                    </p>
                  )}
                </td>
                <td className="py-3 px-3 text-[#7A7A78] whitespace-nowrap">
                  {formatTakenDate(row.takenAt)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span
                    className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${scorePillClass(row.scorePct)}`}
                  >
                    {row.scoreLabel}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
