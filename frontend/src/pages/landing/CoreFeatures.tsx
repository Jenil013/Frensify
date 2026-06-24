import React from "react";
import { motion } from "motion/react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { FEATURE_MODULES } from "./landingConstants";

export default function CoreFeatures() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section id="features" ref={ref} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F47AF] mb-3">
            Four Skills · One Destination
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            The Skills That Unlock Canada
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            Every module you master on Frensify maps directly to a CEFR benchmark, and to a real outcome in your Canadian future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURE_MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                className="group bg-white border border-[#E9E9E7] rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:ring-2"
                    style={{
                      backgroundColor: mod.bgColor,
                      ["--tw-ring-color" as string]: mod.borderColor,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: mod.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#7A7A78] mb-1">
                      {mod.labelFr}
                    </p>
                    <h3 className="text-base font-bold text-[#37352F] mb-1.5">
                      {mod.labelEn}
                    </h3>
                    <p className="text-xs text-[#5F5E5B] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
