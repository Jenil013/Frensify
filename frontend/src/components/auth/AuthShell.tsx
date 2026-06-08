import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FrensifyLogo from "../FrensifyLogo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <header className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#5F5E5B] hover:text-[#37352F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <FrensifyLogo height={36} showSubtext={false} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#E9E9E7] p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
