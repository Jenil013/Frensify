import React from "react";
import { motion } from "motion/react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { TRUST_POINTS } from "./landingConstants";

export default function TrustBar() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} className="bg-white border-y border-[#E9E9E7] py-6">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-wrap justify-center gap-6 md:gap-0 md:justify-between">
          {TRUST_POINTS.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-2.5 px-3 md:px-0"
              >
                <Icon className="w-4 h-4 text-[#0F47AF] shrink-0" />
                <span className="text-xs font-medium text-[#5F5E5B] whitespace-nowrap">
                   {point.label}
                 </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
