import React from "react";
import { Check, Star, Shield, Zap, Sparkles, HelpCircle } from "lucide-react";
import { UserProfile, UserSubscriptionTier } from "../types";

interface PricingTabProps {
  profile: UserProfile;
  onUpdateTier: (tier: UserSubscriptionTier) => void;
}

export default function PricingTab({
  profile,
  onUpdateTier,
}: PricingTabProps) {
  const tiers = [
    {
      name: "Free" as UserSubscriptionTier,
      price: "$0",
      period: "forever",
      description: "Build foundational skills and explore simple mock exercises.",
      badge: "Foundation Builder",
      badgeColor: "bg-[#F1F1EF] text-[#5F5E5B] border-[#E9E9E7]",
      cta: "Current Tier",
      features: [
        "Select static vocabulary lists",
        "Elementary static level practice drills",
        "Limited daily questions",
        "Self-graded multiple choice keys",
      ],
      notIncluded: [
        "AI Writing correction and analysis",
        "AI Speaking accent & fluency evaluation",
        "Official full length mock tests",
        "Personalized week study planner",
        "Progress trend analytics dashboards",
      ]
    },
    {
      name: "Pro" as UserSubscriptionTier,
      price: "$19.99",
      period: "per month",
      description: "Structured timeline preparation equipped with AI feedback algorithms.",
      badge: "Most Popular Value",
      badgeColor: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]",
      cta: "Promote to Pro",
      features: [
        "Include all Free essentials",
        "2 fully timed TEF/TCF Mock Exams",
        "AI Writing Correction & grading analysis",
        "Interactive analytics and readiness tracking",
        "Personalized AI study plans customized daily",
      ],
      notIncluded: [
        "Unlimited speaking sound recorder analysis",
        "Unlimited exam simulation iterations",
        "Custom priority model spoken drafts"
      ],
      customAccent: "border-[#1A73E8] shadow-premium-lg"
    },
    {
      name: "Max" as UserSubscriptionTier,
      price: "$29.99",
      period: "per month",
      description: "Completely unlimited drills and advanced conversational simulations.",
      badge: "Absolute Mastery Class",
      badgeColor: "bg-[#EEEFFC] text-[#4A55A2] border-[#DDE0FA]",
      cta: "Accelerate to Max",
      features: [
        "Include all Pro benefits",
        "Unlimited simulated Full Mock exams",
        "Unlimited speaking audio recordings analyzed",
        "Advanced conversational speaking simulations",
        "AI speaking accent pronunciation models",
        "Priority VIP Gemini response channels",
      ],
      notIncluded: []
    }
  ];

  return (
    <div id="pricing-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Subscription Pricing</h2>
        <p className="text-xs text-[#7A7A78]">Select the optimal coach tier to secure your Express Entry or university certification marks.</p>
        
        {/* Active state warning tip */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 bg-[#F1F1EF] border border-[#E9E9E7] text-[10px] text-[#5F5E5B] font-bold px-3 py-1 rounded">
            <Sparkles className="w-3.5 h-3.5 text-[#9A5013]" />
            ACTIVE PLAN TARGET: <strong>{profile.tier}</strong> (Click any button below to immediately change demo status)
          </span>
        </div>
      </div>

      {/* Pricing Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 items-stretch">
        {tiers.map((t) => {
          const isActive = profile.tier === t.name;
          return (
            <div 
              key={t.name}
              className={`bg-white border text-left rounded-xl p-5 md:p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                t.customAccent || "border-[#E9E9E7] shadow-premium"
              } ${isActive ? "border-2 border-[#37352F]" : ""}`}
            >
              {isActive && (
                <div className="absolute right-0 top-0 bg-[#37352F] text-white px-3 py-0.5 rounded-bl text-[9px] font-bold uppercase tracking-wider">
                  Active tier
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wide rounded border ${t.badgeColor} mb-2.5`}>
                    {t.badge}
                  </span>
                  <h3 className="text-base font-bold text-[#37352F]">{t.name} Plan</h3>
                  <p className="text-xs text-[#7A7A78] mt-1 leading-relaxed">{t.description}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2.5 border-y border-[#F1F1EF]">
                  <span className="text-3xl font-bold text-[#37352F]">{t.price}</span>
                  <span className="text-xs text-[#7A7A78]">/ {t.period}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">Syllabus allocation:</p>
                  <ul className="space-y-1.5">
                    {t.features.map((feat) => (
                      <li key={feat} className="text-xs text-[#5F5E5B] flex gap-2 items-start leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-[#2D6A53] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                    {t.notIncluded.map((feat) => (
                      <li key={feat} className="text-xs text-[#9B9A97] opacity-65 flex gap-2 items-start leading-relaxed">
                        <span className="text-sm font-bold text-[#B83E5C] shrink-0 mt-[-1px]">&times;</span>
                        <span className="line-through">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onUpdateTier(t.name)}
                  className={`w-full py-2 text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer ${
                    isActive 
                      ? "bg-[#EAF5F1] border border-[#D1EBE1] text-[#2D6A53]" 
                      : "bg-[#37352F] hover:bg-black text-white"
                  }`}
                >
                  {isActive ? "Currently Active Plan" : t.cta}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust section */}
      <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-left space-y-0.5">
          <h4 className="text-xs font-bold text-[#37352F] uppercase">100% Curriculum Guarantee</h4>
          <p className="text-[11px] text-[#7A7A78]">Our simulations follow the precise grids of Paris Chamber of Commerce and Alliance Française.</p>
        </div>
        <p className="text-[10px] text-[#7B7B79] font-mono">🔒 Encrypted checkouts & secure cancels active</p>
      </div>

    </div>
  );
}
