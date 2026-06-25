import React, { useEffect } from "react";
import { X } from "lucide-react";
import type { RecentTestItem } from "../lib/apiClient";
import RecentTestsTable from "./RecentTestsTable";

interface RecentTestsModalProps {
  open: boolean;
  onClose: () => void;
  tests: RecentTestItem[];
  loading: boolean;
}

export default function RecentTestsModal({
  open,
  onClose,
  tests,
  loading,
}: RecentTestsModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recent-tests-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/30 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-xl border border-[#E9E9E7] flex flex-col animate-fade-in">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#E9E9E7] shrink-0">
          <div>
            <h2
              id="recent-tests-modal-title"
              className="text-base font-bold text-[#37352F] tracking-tight"
            >
              All recent tests
            </h2>
            <p className="text-xs text-[#7A7A78] mt-0.5">
              Mock simulations and practice sessions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A78] hover:bg-[#F1F1EF] hover:text-[#37352F] transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 overflow-hidden">
          <RecentTestsTable
            tests={tests}
            loading={loading}
            maxHeightClass="max-h-[60vh]"
          />
        </div>

        <div className="px-6 py-4 border-t border-[#E9E9E7] shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#37352F] hover:bg-[#2B2A28] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
