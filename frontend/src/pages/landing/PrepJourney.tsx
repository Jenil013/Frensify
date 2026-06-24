import React from "react";
import { motion } from "motion/react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { JOURNEY_STEPS } from "./landingConstants";

export default function PrepJourney() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F47AF] mb-3">
            Your Roadmap
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            Your Journey To Canada
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            A structured path from beginner French to Canadian opportunities — every level mapped to a real milestone.
          </p>
        </motion.div>

        {/* Desktop: horizontal flow */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-[60px] right-[60px] h-[2px] border-t-2 border-dashed border-[#E9E9E7]" />

          {JOURNEY_STEPS.map((step, i) => {
            const isCanada = step.level === "🇨🇦";
            const isCLB = step.level === "CLB 7";
            return (
              <motion.div
                key={step.level}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.12 + i * 0.1 }}
                className="flex flex-col items-center text-center relative group"
                style={{ width: `${100 / JOURNEY_STEPS.length}%` }}
              >
                {/* Level badge */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4 relative z-10 transition-all duration-300 group-hover:ring-2 group-hover:ring-offset-2"
                  style={{
                    background: isCanada
                      ? "linear-gradient(135deg, #D4AF37, #B8961F)"
                      : isCLB
                      ? "#002D62"
                      : "#37352F",
                    color: "#fff",
                    fontSize: isCanada ? "18px" : "12px",
                    ["--tw-ring-color" as string]: isCanada ? "#D4AF37" : "#F2A600",
                  }}
                >
                  {step.level}
                </div>

                <div
                  className={`bg-white border rounded-xl p-4 w-full transition-all duration-300 group-hover:-translate-y-1 ${
                    isCanada
                      ? "border-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
                      : isCLB
                      ? "border-[#002D62]/30 shadow-[0_4px_20px_rgba(0,45,98,0.08)]"
                      : "border-[#E9E9E7] shadow-premium"
                  }`}
                >
                  <h3 className="text-xs font-bold text-[#37352F] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[10px] text-[#5F5E5B] leading-relaxed mb-2">
                    {step.description}
                  </p>
                  {step.milestone && (
                    <span
                      className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: isCanada
                          ? "#FDF3E7"
                          : isCLB
                          ? "#EEF3FF"
                          : "#F4F4F2",
                        color: isCanada
                          ? "#9A5013"
                          : isCLB
                          ? "#2346D8"
                          : "#7A7A78",
                      }}
                    >
                      {step.milestone}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-4 relative pl-8">
          <div className="absolute left-[19px] top-5 bottom-5 w-[2px] border-l-2 border-dashed border-[#E9E9E7]" />

          {JOURNEY_STEPS.map((step, i) => {
            const isCanada = step.level === "🇨🇦";
            const isCLB = step.level === "CLB 7";
            return (
              <motion.div
                key={step.level}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="relative flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 relative z-10 -ml-8"
                  style={{
                    background: isCanada
                      ? "linear-gradient(135deg, #D4AF37, #B8961F)"
                      : isCLB
                      ? "#002D62"
                      : "#37352F",
                    color: "#fff",
                    fontSize: isCanada ? "18px" : "12px",
                  }}
                >
                  {step.level}
                </div>
                <div
                  className={`bg-white border rounded-xl p-4 shadow-premium flex-1 ${
                    isCanada
                      ? "border-[#D4AF37]"
                      : isCLB
                      ? "border-[#002D62]/30"
                      : "border-[#E9E9E7]"
                  }`}
                >
                  <h3 className="text-sm font-bold text-[#37352F] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#5F5E5B] leading-relaxed mb-2">
                    {step.description}
                  </p>
                  {step.milestone && (
                    <span
                      className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: isCanada ? "#FDF3E7" : isCLB ? "#EEF3FF" : "#F4F4F2",
                        color: isCanada ? "#9A5013" : isCLB ? "#2346D8" : "#7A7A78",
                      }}
                    >
                      {step.milestone}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
