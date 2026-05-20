import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { UserProfile, ExamPathway } from "../types";
import {
  CefrLevel,
  TEF_TARGET_OPTIONS,
  parseCefrTarget,
  getTefTargetLabel,
} from "../tefConstants";
import TefGradingScheme from "./tef/TefGradingScheme";
import TefScoreEquivalenceTable from "./tef/TefScoreEquivalenceTable";

interface AccountTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export default function AccountTab({
  profile,
  onUpdateProfile,
}: AccountTabProps) {
  const [name, setName] = useState(profile.name);
  const [preferredExam, setPreferredExam] = useState<ExamPathway>(profile.targetExam);
  const [motivation, setMotivation] = useState("Canada Immigration (Express Entry)");
  const [targetLevel, setTargetLevel] = useState<CefrLevel>(
    parseCefrTarget(profile.targetScore)
  );
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setTargetLevel(parseCefrTarget(profile.targetScore));
  }, [profile.targetScore]);

  const selectedTargetMeta = TEF_TARGET_OPTIONS.find((o) => o.value === targetLevel);

  const handleSave = () => {
    onUpdateProfile({
      name,
      targetExam: preferredExam,
      targetScore: targetLevel,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div id="account-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Candidate Profile & Settings</h2>
        <p className="text-xs text-[#7A7A78]">Calibrate your official exam pathway parameters and certification parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E9E9E7] rounded-xl p-5 md:p-6 shadow-premium space-y-5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#7A7A78] pb-1 border-b border-[#F1F1EF]">Candidate Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block">Full Candidate Name</label>
              <input
                type="text"
                value={name}
                id="input-name"
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg outline-none focus:border-[#1A73E8] focus:bg-white text-[#37352F]"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block">Target Exam Pathway</label>
              <div className="flex gap-2">
                {(["TEF", "TCF"] as ExamPathway[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreferredExam(p)}
                    className={`flex-1 text-xs py-2 rounded-lg border font-bold transition-all cursor-pointer ${
                      preferredExam === p 
                        ? "bg-[#37352F] border-[#37352F] text-white" 
                        : "bg-white border-[#E9E9E7] text-[#5F5E5B] hover:bg-[#FAFAF9]"
                    }`}
                  >
                    {p} Preparation
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block">Diagnostic Motivation</label>
              <select
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg text-[#5F5E5B] outline-none cursor-pointer focus:bg-white"
              >
                <option value="Canada Immigration">Canada Immigration & PR (Express Entry / CRS)</option>
                <option value="French Citizenship">French Citizenship Certification</option>
                <option value="University Admission">European University Admissions (DAP)</option>
                <option value="Career & Business Growth">Professional Career Advancement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] block">
                Desired Score Target
              </label>
              <select
                id="select-target-cefr"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as CefrLevel)}
                className="w-full text-xs px-3 py-2 bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg text-[#37352F] font-bold outline-none cursor-pointer focus:border-[#1A73E8] focus:bg-white"
              >
                {TEF_TARGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {selectedTargetMeta && (
                <p className="text-[10px] text-[#7A7A78] leading-relaxed">
                  {selectedTargetMeta.subtitle}
                  {selectedTargetMeta.canadaNote && (
                    <span className="block text-[#1D74B4] mt-0.5">
                      🇨🇦 {selectedTargetMeta.canadaNote}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {showToast && (
            <div className="bg-[#EAF5F1] border border-[#D1EBE1] text-xs p-3.5 rounded-lg text-[#2D6A53] flex gap-2 items-center animate-fade-in font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <p>
                Target set to {getTefTargetLabel(targetLevel)} — synced for analytics & NCLC tracking.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              id="btn-save-profile"
              onClick={handleSave}
              className="px-4 py-2 bg-[#2D6A53] hover:bg-[#204E3C] text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Save Profile Configuration
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#7A7A78] pb-1 border-b border-[#F1F1EF]">Subscription Status</h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg text-center">
                <p className="text-[9px] uppercase font-bold text-[#7A7A78] tracking-widest mb-1">Active Plan Package</p>
                <p className="text-lg font-bold text-[#37352F] uppercase tracking-wider">{profile.tier}</p>
              </div>

              <div className="text-xs text-[#5F5E5B] leading-relaxed font-mono space-y-1">
                <p><strong>Candidate:</strong> {profile.email}</p>
                <p><strong>Examiner Locale:</strong> FR Paris GMT+1</p>
                <p><strong>CEFR Target:</strong> {getTefTargetLabel(parseCefrTarget(profile.targetScore))}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3.5 text-xs text-[#5F5E5B] space-y-1">
            <p className="font-bold text-[#9A5013] uppercase tracking-wide text-[10px]">Candidate Compliance</p>
            <p className="leading-relaxed text-[11px]">
              Frensify protects your diagnostic logs and audio transcripts using secure sandboxing protocols.
            </p>
          </div>
        </div>
      </div>

      {preferredExam === "TEF" && (
        <div className="space-y-6 bg-white border border-[#E9E9E7] rounded-xl p-5 md:p-6 shadow-premium">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#7A7A78] pb-1 border-b border-[#F1F1EF]">
            TEF Official Grading Reference
          </h3>
          <TefScoreEquivalenceTable targetCefr={targetLevel} showSample />
          <TefGradingScheme highlightLevel={targetLevel} />
        </div>
      )}
    </div>
  );
}
