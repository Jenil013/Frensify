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
            Success Stories
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            Trusted by Learners Worldwide
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            From immigration goals to university admission — see how Frensify helps candidates achieve their targets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="bg-white border border-[#E9E9E7] rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300"
            >
              <p className="text-sm text-[#37352F] leading-relaxed italic mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: t.bgColor, color: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#37352F]">{t.name}</p>
                  <p className="text-[10px] text-[#7A7A78]">{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
