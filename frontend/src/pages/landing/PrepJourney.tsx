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
            Your Journey
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            From First Lesson to Exam Day
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            A structured path that makes preparation feel manageable, not overwhelming.
          </p>
        </motion.div>

        {/* Desktop: horizontal flow */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-[60px] right-[60px] h-[2px] border-t-2 border-dashed border-[#E9E9E7]" />

          {JOURNEY_STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
              className="flex flex-col items-center text-center w-1/4 relative group"
            >
              <div className="w-10 h-10 rounded-full bg-[#002D62] text-white flex items-center justify-center text-sm font-bold mb-4 relative z-10 transition-all duration-300 group-hover:ring-2 group-hover:ring-[#F2A600] group-hover:ring-offset-2">
                {step.number}
              </div>
              <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium w-full">
                <h3 className="text-sm font-bold text-[#37352F] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-[#5F5E5B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-4 relative pl-8">
          <div className="absolute left-[19px] top-5 bottom-5 w-[2px] border-l-2 border-dashed border-[#E9E9E7]" />

          {JOURNEY_STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="relative flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#002D62] text-white flex items-center justify-center text-sm font-bold shrink-0 relative z-10 -ml-8">
                {step.number}
              </div>
              <div className="bg-white border border-[#E9E9E7] rounded-xl p-4 shadow-premium flex-1">
                <h3 className="text-sm font-bold text-[#37352F] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[#5F5E5B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
