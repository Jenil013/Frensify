import React from "react";
import {
  Trophy,
  BookOpen,
  CreditCard,
  User,
  GraduationCap,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { UserProfile, UserSubscriptionTier } from "../types";
import FrensifyLogo from "./FrensifyLogo";

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: Trophy },
  { id: "practice", label: "Practice Drills", icon: BookOpen },
  { id: "exams", label: "Full Simulations", icon: GraduationCap },
  { id: "vocabulary", label: "Vocabulary Builder", icon: Zap },
  { id: "pricing", label: "Subscription Pricing", icon: CreditCard },
  { id: "account", label: "Candidate Settings", icon: User },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  profile: UserProfile;
  onUpdateTier: (tier: UserSubscriptionTier) => void;
  collapsed: boolean;
  isMobile: boolean;
  isExpanded: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

function NavTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#37352F] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-premium-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {label}
    </span>
  );
}

export default function AppSidebar({
  activeTab,
  onTabChange,
  profile,
  onUpdateTier,
  collapsed,
  isMobile,
  isExpanded,
  mobileOpen,
  onToggle,
  onCloseMobile,
}: AppSidebarProps) {
  const showLabels = isExpanded;
  const showTooltips = collapsed && !isMobile;

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (isMobile) onCloseMobile();
  };

  const sidebarWidth = isMobile ? 256 : collapsed ? 72 : 256;

  const sidebarPadding = collapsed && !isMobile ? "p-3" : "p-6";

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#37352F]/20 backdrop-blur-[1px] transition-opacity duration-300 ease-in-out md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        style={{ width: sidebarWidth }}
        className={[
          "bg-[#F1F1EF] border-[#E9E9E7] flex flex-col justify-between shrink-0",
          "transition-[width,transform,padding] duration-300 ease-in-out",
          sidebarPadding,
          isMobile
            ? "fixed inset-y-0 left-0 z-50 border-r shadow-premium-xl"
            : "relative border-r",
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0",
        ].join(" ")}
      >
        <div className={`space-y-6 ${collapsed && !isMobile ? "space-y-5" : ""}`}>
          <div className="space-y-3">
            <div
              className={`flex items-center w-full ${
                showLabels ? "justify-between gap-2" : "justify-between gap-0.5"
              }`}
            >
              <div
                className={`min-w-0 shrink-0 ${showLabels ? "px-1 py-1 flex-1" : ""}`}
              >
                {collapsed && !isMobile ? (
                  <FrensifyLogo compact height={24} />
                ) : (
                  <FrensifyLogo height={40} showSubtext />
                )}
              </div>

              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls="app-sidebar"
                aria-label={
                  isMobile
                    ? mobileOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                    : collapsed
                      ? "Expand sidebar"
                      : "Collapse sidebar"
                }
                className={`shrink-0 rounded-lg text-[#7A7A78] hover:text-[#37352F] hover:bg-[#E3E2E0]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F]/20 ${
                  collapsed && !isMobile ? "p-1.5" : "p-2"
                }`}
              >
                {isExpanded ? (
                  <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <nav className="space-y-0.5" aria-label="Workspace sections">
            {NAV_ITEMS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    title={showTooltips ? tab.label : undefined}
                    className={[
                      "w-full flex items-center rounded-lg text-xs font-medium transition-all",
                      showLabels ? "gap-2.5 px-3 py-2 text-left" : "justify-center px-2 py-2.5",
                      isActive
                        ? "bg-[#E3E2E0]/50 text-[#37352F] font-semibold"
                        : "text-[#5F5E5B] hover:text-[#37352F] hover:bg-[#E3E2E0]/20",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F]/20",
                    ].join(" ")}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "text-[#37352F]" : "text-[#7B7B79]"}`}
                      aria-hidden="true"
                    />
                    {showLabels && <span className="truncate">{tab.label}</span>}
                  </button>
                  <NavTooltip label={tab.label} show={showTooltips} />
                </div>
              );
            })}
          </nav>
        </div>

        <div className={`space-y-4 ${!showLabels ? "space-y-2" : ""}`}>
          {showLabels ? (
            <>
              <div className="bg-[#E9F3FC] rounded-2xl p-4.5 border border-[#D2E7F6] shadow-sm">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#1D74B4] block mb-1.5">
                  Upgrade Status
                </span>
                <p className="text-[11px] text-[#2563EB] leading-relaxed mb-3">
                  {profile.tier === "Free"
                    ? "Get unlimited argumentative mock evaluations and AI voice coach suggestions."
                    : profile.tier === "Pro"
                      ? "You have 2 Mock simulations. Upgrade to Max for unlimited speaking booth advice."
                      : "Aviation-Speed AI channels active. Unlimited simulated examinations unlocked."}
                </p>
                {profile.tier !== "Max" ? (
                  <button
                    type="button"
                    onClick={() => handleTabClick("pricing")}
                    className="w-full py-1.5 bg-[#1F2937] hover:bg-black text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    {profile.tier === "Free" ? "Become Pro" : "Ascend to Max"}
                  </button>
                ) : (
                  <div className="bg-[#E5F2EE] border border-[#CDDFD9] p-2 rounded-lg text-center text-[10px] font-bold text-[#2D6A53]">
                    👑 Max Coaching Active
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E9E9E7] rounded-xl p-2.5 text-center shadow-sm">
                <span className="text-[9px] font-bold uppercase text-[#7A7A78] block mb-1.5">
                  Demo Tier Selector
                </span>
                <div className="flex gap-1">
                  {(["Free", "Pro", "Max"] as UserSubscriptionTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onUpdateTier(tier)}
                      className={`flex-1 text-[9px] py-1 rounded-md font-bold uppercase tracking-wider transition-all border ${
                        profile.tier === tier
                          ? "bg-[#37352F] text-white border-[#37352F]"
                          : "bg-white text-[#7B7B79] border-[#E9E9E7] hover:bg-[#F1F1EF]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {profile.tier !== "Max" && (
                <div className="relative group flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleTabClick("pricing")}
                    title="Upgrade plan"
                    aria-label="Upgrade plan"
                    className="p-2.5 rounded-xl bg-[#E9F3FC] border border-[#D2E7F6] text-[#1D74B4] hover:bg-[#D2E7F6]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F]/20"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <NavTooltip label="Upgrade plan" show={showTooltips} />
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export { NAV_ITEMS };
