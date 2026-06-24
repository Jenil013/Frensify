import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function FinalCTA() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#F1F1EF]">
      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-[#0F47AF] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Votre avenir francophone commence maintenant.
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-[#37352F] mb-6"
        >
          Ready to Start Your Exam Journey?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm text-[#5F5E5B] mb-8 max-w-md mx-auto"
        >
          Your TEF or TCF goal is closer than it feels, start your
          French preparation today with a free account.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001D42] text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-premium-lg transition-all hover:shadow-premium-xl"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
