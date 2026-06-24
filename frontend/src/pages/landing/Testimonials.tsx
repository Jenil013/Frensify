import React from "react";
import { motion } from "motion/react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { TESTIMONIALS } from "./landingConstants";

export default function Testimonials() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F47AF] mb-3">
            Real Results
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            Learners Who Reached Canada
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            Not testimonials about features. Stories about outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="bg-white border border-[#E9E9E7] rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 flex flex-col"
            >
              {/* Result badges — focal point */}
              <div className="flex gap-2 mb-5">
                <div
                  className="flex-1 rounded-xl px-3 py-2.5 text-center"
                  style={{ backgroundColor: t.bgColor }}
                >
                  <p
                    className="text-sm font-bold leading-tight"
                    style={{ color: t.color }}
                  >
                    {t.result}
                  </p>
                  <p className="text-[9px] text-[#7A7A78] mt-0.5 font-medium">
                    {t.resultDetail}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-xs text-[#5F5E5B] leading-relaxed italic mb-5 flex-1">
                "{t.quote}"
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: t.bgColor, color: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#37352F]">
                    {t.flag} {t.name}
                  </p>
                  <p className="text-[10px] text-[#7A7A78]">{t.location}</p>
                  <p className="text-[10px] text-[#9B9691]">{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
