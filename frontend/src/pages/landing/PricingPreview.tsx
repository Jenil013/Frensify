import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { PRICING_TIERS } from "./landingConstants";

export default function PricingPreview() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section id="pricing" ref={ref} className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F47AF] mb-3">
            Simple Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
            Choose Your Preparation Level
          </h2>
          <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
            Start free and upgrade when you're ready for AI-powered feedback and full exam simulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className={`relative bg-white rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                tier.highlighted
                  ? "border-[#0F47AF] border-2 shadow-premium-xl"
                  : "border-[#E9E9E7] shadow-premium hover:shadow-premium-lg"
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${tier.badgeColor}`}
                >
                  {tier.badge}
                </span>
              )}

              <div className="mb-5 pt-1">
                <h3 className="text-base font-bold text-[#37352F] mb-1">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-[#37352F]">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#7A7A78]">
                    {tier.period}
                  </span>
                </div>
                <p className="text-xs text-[#5F5E5B] mt-2">
                  {tier.tagline}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-[#2D6A53] mt-0.5 shrink-0" />
                    <span className="text-xs text-[#5F5E5B]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/auth?mode=signup"
                className={`block w-full text-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  tier.highlighted
                    ? "bg-[#002D62] hover:bg-[#001D42] text-white shadow-premium"
                    : "bg-[#37352F] hover:bg-[#1a1917] text-white"
                }`}
              >
                {tier.name === "Free" ? "Start Free" : `Get ${tier.name}`}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
