import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { FAQ_ITEMS } from "./landingConstants";

export default function FAQ() {
  const { ref, isInView } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" ref={ref} className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F47AF] mb-3">
            Common Questions
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            Everything you need to know about TEF, TCF, and how Frensify prepares you.
          </p>
        </motion.div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
              className="bg-white border border-[#E9E9E7] rounded-xl overflow-hidden shadow-premium"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAF9F7] transition-colors"
              >
                <span className="text-sm font-semibold text-[#37352F] pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#7A7A78] shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-xs text-[#5F5E5B] leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
