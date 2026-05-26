import React from "react";
import { motion } from "motion/react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { AI_FEATURES } from "./landingConstants";

export default function AIPowered() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 bg-gradient-to-br from-[#002D62] to-[#001840] relative overflow-hidden"
    >
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F47AF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F2A600]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Left — text block */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-md"
          >
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#F2A600] mb-3">
              Powered by AI
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Intelligent Feedback That Accelerates Your Progress
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Our AI engine goes beyond generic tips — it analyzes your actual
              performance to deliver corrections, suggestions, and study plans
              tailored to your specific weak points and exam goals.
            </p>
            <p className="text-xs text-white/40">
              Available on Pro and Max plans.
            </p>
          </motion.div>

          {/* Right — feature cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {AI_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-[#F2A600] mb-3" />
                  <h3 className="text-sm font-bold text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
