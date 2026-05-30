import React from "react";
import FrensifyLogo from "../FrensifyLogo";

export default function AuthLoadingScreen({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center gap-4">
      <FrensifyLogo height={40} showSubtext={false} />
      <p className="text-sm text-[#7A7A78]">{message}</p>
    </div>
  );
}
