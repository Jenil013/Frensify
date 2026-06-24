import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";



// ─── Circular progress ring ──────────────────────────────────────────────────
function CircularRing({
  score,
  max,
  size,
  strokeWidth,
  color,
  delay,
  label,
  centerContent,
}: {
  score: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  delay: number;
  label?: string;
  centerContent?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score / max;
  const progressRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const target = circumference * (1 - pct);
    const controls = animate(circumference, target, {
      duration: 1.4,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => {
        if (progressRef.current) {
          progressRef.current.style.strokeDashoffset = String(v);
        }
      },
    });
    return controls.stop;
  }, [circumference, pct, delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EDE9E3"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={progressRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        {/* Center content */}
        {centerContent && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {centerContent}
          </div>
        )}
      </div>
      {label && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            color: "#6B6762",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ─── Small module ring (Listening / Reading / Writing / Speaking) ─────────────
function ModuleRing({
  label,
  level,
  progress,
  color,
  delay,
}: {
  label: string;
  level: string;
  progress: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
    >
      <CircularRing
        score={progress * 100}
        max={100}
        size={64}
        strokeWidth={5}
        color={color}
        delay={delay}
        centerContent={
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "13px",
              fontWeight: 700,
              color: "#1A1A1A",
              lineHeight: 1,
            }}
          >
            {level}
          </span>
        }
      />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 500,
          color: "#6B6762",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ─── Realistic learner avatar using initials + gradient ──────────────────────
const LEARNER_AVATARS = [
  { initials: "MS", bg: "linear-gradient(135deg, #2D6A53 0%, #3D9B7A 100%)" },
  { initials: "AK", bg: "linear-gradient(135deg, #2346D8 0%, #4F6FEF 100%)" },
  { initials: "PL", bg: "linear-gradient(135deg, #B83E5C 0%, #D46080 100%)" },
  { initials: "RJ", bg: "linear-gradient(135deg, #9A5013 0%, #C4671A 100%)" },
];

export default function HeroSection() {
  // Total overall score for big ring
  const totalScore = 285 + 310 + 295 + 300; // 1190
  const totalMax = 360 * 4; // 1440

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#FAF9F7",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ── Background: uploaded handwritten French words image ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
  style={{
  position: "absolute",
  inset: 0, // top:0, right:0, bottom:0, left:0
  width: "100%",
  height: "100%",
  backgroundImage: "url('/images/hero_background.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  pointerEvents: "none",
}}
/>
        {/* Soft wave lines */}
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.03,
          }}
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-100 280 Q360 180 720 320 Q1080 460 1540 280"
            stroke="#2346D8"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-100 480 Q360 360 720 500 Q1080 640 1540 460"
            stroke="#2346D8"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M-100 680 Q360 560 720 680 Q1080 800 1540 640"
            stroke="#D4AF37"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "120px 48px 80px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "64px",
        }}
        className="hero-inner"
      >
        {/* LEFT — text */}
        <div style={{ flex: "0 0 44%", maxWidth: "520px" }}>
          {/* Flag label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0, ease: "easeOut" }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#EEF3FF",
              border: "1px solid #D5E0FF",
              borderRadius: "99px",
              padding: "6px 14px 6px 10px",
              marginBottom: "32px",
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>🇨🇦</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "#2346D8",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Bonjour, futur francophone.
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(38px, 4.5vw, 58px)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              color: "#1A1A1A",
              marginBottom: "24px",
            }}
          >
            Your Canadian Future{" "}
            <br />
            Starts with{" "}
            <em
              style={{
                color: "#2346D8",
                fontStyle: "italic",
                position: "relative",
                display: "inline-block",
              }}
            >
              French
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "-2px",
                  width: "100%",
                  height: "2px",
                  background: "linear-gradient(90deg, #D4AF37, #2346D8)",
                  borderRadius: "2px",
                  transformOrigin: "left",
                }}
              />
            </em>
            .
          </motion.h1>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.8,
              color: "#6B6762",
              marginBottom: "40px",
              maxWidth: "440px",
            }}
          >
            Reach B2 faster with AI-powered TEF &amp; TCF preparation
            designed for Canadian immigration, university admission, and
            career growth.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: "easeOut" }}
            style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}
          >
            <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.975 }}>
              <Link
                to="/auth?mode=signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#1A1A1A",
                  color: "#FAF9F7",
                  borderRadius: "14px",
                  padding: "14px 26px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 4px 24px rgba(26,26,26,0.18)",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
              >
                Start Free Practice
                <ArrowRight size={15} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  color: "#1A1A1A",
                  borderRadius: "14px",
                  padding: "14px 20px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  border: "1.5px solid #ECE8E1",
                  textDecoration: "none",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                See How It Works
                <ChevronRight size={14} style={{ color: "#9B9691" }} />
              </a>
            </motion.div>
          </motion.div>

          {/* Social proof strip — upgraded avatars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            style={{
              marginTop: "36px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Realistic-feeling avatar stack with initials */}
            <div style={{ display: "flex" }}>
              {LEARNER_AVATARS.map((av, i) => (
                <div
                  key={i}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: av.bg,
                    border: "2.5px solid #FAF9F7",
                    marginLeft: i === 0 ? 0 : "-10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    zIndex: LEARNER_AVATARS.length - i,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {av.initials}
                  </span>
                </div>
              ))}
              {/* +count bubble */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#EEF3FF",
                  border: "2.5px solid #FAF9F7",
                  marginLeft: "-10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  position: "relative",
                  zIndex: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#2346D8",
                  }}
                >
                  5k+
                </span>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  lineHeight: 1.3,
                }}
              >
                Trusted by 5,000+ learners
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  color: "#9B9691",
                  lineHeight: 1.4,
                }}
              >
                preparing for Canadian immigration
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Premium progress card */}
        <motion.div
          initial={{ opacity: 0, x: 32, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ flex: "1 1 0%", display: "flex", justifyContent: "center" }}
        >
          {/* Floating animation wrapper */}
          <div
            className="hero-scorecard-float"
            style={{ width: "100%", maxWidth: "440px", position: "relative" }}
          >
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "110%",
                height: "110%",
                background: "radial-gradient(ellipse at center, rgba(35,70,216,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
                borderRadius: "50%",
              }}
            />

            {/* Card */}
            <div
              className="hero-scorecard"
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                border: "1px solid #ECE8E1",
                boxShadow: "0px 10px 40px rgba(0,0,0,0.06)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Card top bar */}
              <div
                style={{
                  background: "#FFFDF8",
                  borderBottom: "1px solid #ECE8E1",
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2346D8, #1D3BA8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        letterSpacing: "0.04em",
                      }}
                    >
                      FR
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1A1A1A",
                        lineHeight: 1.2,
                      }}
                    >
                      Your Progress
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        color: "#9B9691",
                        lineHeight: 1.2,
                      }}
                    >
                      TEF Canada · Mock Exam 3
                    </p>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "28px 24px 24px" }}>

                {/* ── LARGE CENTRAL CEFR RING ── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.65, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "28px",
                  }}
                >
                  <CircularRing
                    score={totalScore}
                    max={totalMax}
                    size={148}
                    strokeWidth={10}
                    color="url(#cefrGradient)"
                    delay={0.45}
                    centerContent={
                      <>
                        {/* inline gradient def */}
                        <svg width={0} height={0} style={{ position: "absolute" }}>
                          <defs>
                            <linearGradient id="cefrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2346D8" />
                              <stop offset="100%" stopColor="#D4AF37" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: "26px",
                            fontWeight: 700,
                            color: "#1A1A1A",
                            lineHeight: 1,
                          }}
                        >
                          B1
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            fontWeight: 500,
                            color: "#9B9691",
                            letterSpacing: "0.04em",
                            marginTop: "4px",
                          }}
                        >
                          Current Level
                        </span>
                      </>
                    }
                  />

                  {/* CEFR progress note */}
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#2D6A53",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        color: "#6B6762",
                      }}
                    >
                      <strong style={{ color: "#2D6A53", fontWeight: 600 }}>82.6%</strong> toward B2 target
                    </span>
                  </div>
                </motion.div>

                {/* ── MODULE RINGS (4 small) ── */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                    marginBottom: "24px",
                  }}
                >
                  <ModuleRing label="Listening" level="B1" progress={0.79} color="#2D6A53" delay={0.5} />
                  <ModuleRing label="Reading"   level="B2" progress={0.86} color="#2346D8" delay={0.6} />
                  <ModuleRing label="Writing"   level="B1" progress={0.82} color="#9A5013" delay={0.7} />
                  <ModuleRing label="Speaking"  level="B1" progress={0.83} color="#B83E5C" delay={0.8} />
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "#ECE8E1", marginBottom: "20px" }} />

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Current Level", value: "B1", sub: "Intermediate", color: "#2346D8", bg: "#EEF3FF" },
                    { label: "Target",        value: "B2", sub: "Immigration",  color: "#2D6A53", bg: "#EAF5F1" },
                    { label: "CRS Boost",     value: "+40 pts", sub: "Estimated", color: "#9A5013", bg: "#FDF3E7" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                      style={{
                        background: stat.bg,
                        borderRadius: "14px",
                        padding: "14px 12px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "#9B9691",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        {stat.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: stat.color,
                          lineHeight: 1.1,
                          marginBottom: "2px",
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "9px",
                          color: "#9B9691",
                        }}
                      >
                        {stat.sub}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* AI Insight footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  style={{
                    marginTop: "20px",
                    padding: "14px 16px",
                    background: "#FAF9F7",
                    borderRadius: "12px",
                    border: "1px solid #ECE8E1",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "#EEF3FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>✦</span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      color: "#6B6762",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: "#2346D8", fontWeight: 600 }}>AI Insight:</strong>{" "}
                    Improve reading speed by 12% to reach your B2 target.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600;700&display=swap');

        .hero-scorecard-float {
          animation: hero-scorecard-float 7s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        @keyframes hero-scorecard-float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -12px, 0);
          }
        }

        .hero-scorecard {
          transition: box-shadow 0.35s ease;
        }

        .hero-scorecard:hover {
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.11);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-scorecard-float {
            animation: none;
          }
        }

        @media (max-width: 1024px) {
          .hero-inner {
            flex-direction: column !important;
            padding: 100px 32px 64px !important;
            gap: 48px !important;
            align-items: flex-start !important;
          }
          .hero-inner > div:first-child {
            flex: none !important;
            max-width: 100% !important;
          }
          .hero-inner > div:last-child {
            width: 100% !important;
            max-width: 480px !important;
          }
        }

        @media (max-width: 640px) {
          .hero-inner {
            padding: 88px 20px 48px !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
