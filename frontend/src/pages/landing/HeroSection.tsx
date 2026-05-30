import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Headphones, BookOpen, PenTool, Mic } from "lucide-react";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left — text */}
        <div className="flex-1 max-w-xl">
          <motion.p
            {...fade(0)}
            className="text-sm font-semibold uppercase tracking-widest text-[#0F47AF] mb-4"
          >
            Bonjour, futur francophone.
          </motion.p>

          <motion.h1
            {...fade(0.1)}
            className="text-4xl lg:text-5xl font-bold text-[#37352F] leading-tight mb-5"
          >
            Master Your TEF & TCF Exam{" "}
            <span className="text-[#0F47AF]">with Confidence</span>
          </motion.h1>

          <motion.p
            {...fade(0.2)}
            className="text-base lg:text-lg text-[#5F5E5B] leading-relaxed mb-4 max-w-lg"
          >
            AI-powered practice, real exam simulations, and personalized
            coaching — all in one calm, structured platform designed for
            serious exam success.
          </motion.p>

          <motion.p
            {...fade(0.3)}
            className="text-sm text-[#0F47AF]/70 italic font-medium tracking-wide mb-8"
          >
            Your fluency journey starts here.
          </motion.p>

          <motion.div
            {...fade(0.4)}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001D42] text-white rounded-xl px-7 py-3.5 text-sm font-bold shadow-premium-lg transition-all hover:shadow-premium-xl"
            >
              Start Free Practice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-white border border-[#E9E9E7] text-[#37352F] hover:bg-[#F1F1EF] rounded-xl px-6 py-3.5 text-sm font-semibold transition-all shadow-premium"
            >
              See Pricing
            </a>
          </motion.div>
        </div>

        {/* Right — CSS dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex-1 w-full max-w-lg lg:max-w-xl"
        >
          <div
            className="relative rounded-2xl border border-[#E9E9E7] shadow-premium-xl bg-white overflow-hidden"
            style={{ transform: "perspective(1200px) rotateY(-2deg)" }}
          >
            {/* Mockup top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E9E9E7] bg-[#FAFAF9]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9E9E7]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9E9E7]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9E9E7]" />
              </div>
              <div className="flex-1 mx-8 h-5 bg-[#F1F1EF] rounded-md" />
            </div>

            <div className="flex">
              {/* Mini sidebar */}
              <div className="w-16 bg-[#F1F1EF] border-r border-[#E9E9E7] py-4 px-2 space-y-3 hidden sm:block">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${i === 0 ? "bg-[#002D62]/20 w-full" : "bg-[#E9E9E7] w-3/4"}`}
                  />
                ))}
              </div>

              {/* Content area */}
              <div className="flex-1 p-5 space-y-4">
                {/* Welcome */}
                <div>
                  <div className="h-4 w-36 bg-[#37352F]/10 rounded mb-2" />
                  <div className="h-2.5 w-52 bg-[#E9E9E7] rounded" />
                </div>

                {/* Skill cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Headphones, color: "#2D6A53", bg: "#EAF5F1", pct: 90 },
                    { Icon: BookOpen, color: "#9A5013", bg: "#FDF3E7", pct: 72 },
                    { Icon: PenTool, color: "#1D74B4", bg: "#E8F3FC", pct: 85 },
                    { Icon: Mic, color: "#B83E5C", bg: "#FCECF0", pct: 60 },
                  ].map(({ Icon, color, bg, pct }, i) => (
                    <div
                      key={i}
                      className="border border-[#E9E9E7] rounded-xl p-3 bg-white"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: bg }}
                        >
                          <Icon className="w-3 h-3" style={{ color }} />
                        </div>
                        <div className="h-2 w-12 bg-[#E9E9E7] rounded" />
                      </div>
                      <div className="h-1.5 w-full bg-[#F1F1EF] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative accents */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#0F47AF]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#F2A600]/5 rounded-full blur-2xl pointer-events-none" />
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-[#0F47AF]/20" />
      <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-[#F2A600]/30" />
      <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 rounded-full bg-[#D01018]/20" />
    </section>
  );
}
