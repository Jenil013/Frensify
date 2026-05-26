import { Headphones, BookOpen, Mic, PenTool, GraduationCap, Sparkles, Shield, TrendingUp, Globe, Calendar, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TrustPoint {
  icon: LucideIcon;
  label: string;
}

export const TRUST_POINTS: TrustPoint[] = [
  { icon: GraduationCap, label: "TEF & TCF Aligned" },
  { icon: Sparkles, label: "AI-Powered Feedback" },
  { icon: Shield, label: "10,000+ Questions" },
  { icon: TrendingUp, label: "Real-Time Analytics" },
  { icon: Globe, label: "Trusted Worldwide" },
];

export interface FeatureModule {
  id: string;
  labelFr: string;
  labelEn: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const FEATURE_MODULES: FeatureModule[] = [
  {
    id: "listening",
    labelFr: "Compréhension Orale",
    labelEn: "Listening",
    description: "Train your ear with timed exam-style audio practice and build confidence in oral comprehension.",
    icon: Headphones,
    color: "#2D6A53",
    bgColor: "#EAF5F1",
    borderColor: "#D1EBE1",
  },
  {
    id: "reading",
    labelFr: "Compréhension Écrite",
    labelEn: "Reading",
    description: "Improve speed, comprehension, and inference skills with exam-aligned reading passages.",
    icon: BookOpen,
    color: "#9A5013",
    bgColor: "#FDF3E7",
    borderColor: "#FCE1CA",
  },
  {
    id: "speaking",
    labelFr: "Expression Orale",
    labelEn: "Speaking",
    description: "Practice with AI-powered spoken feedback and build natural fluency for the oral exam.",
    icon: Mic,
    color: "#B83E5C",
    bgColor: "#FCECF0",
    borderColor: "#F8D4DE",
  },
  {
    id: "writing",
    labelFr: "Expression Écrite",
    labelEn: "Writing",
    description: "Get AI-powered corrections, structural guidance, and clearer writing for exam tasks.",
    icon: PenTool,
    color: "#1D74B4",
    bgColor: "#E8F3FC",
    borderColor: "#D2E7F6",
  },
];

export interface JourneyStep {
  number: number;
  title: string;
  description: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { number: 1, title: "Diagnose", description: "Take a placement test to identify your CEFR level and weak areas." },
  { number: 2, title: "Practice", description: "Targeted drills on each module, adapted to your skill gaps." },
  { number: 3, title: "Simulate", description: "Full-length mock TEF or TCF exams under real timing conditions." },
  { number: 4, title: "Excel", description: "Track your progress and achieve your target score with confidence." },
];

export interface AIFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const AI_FEATURES: AIFeature[] = [
  { icon: PenTool, title: "Writing Correction Engine", description: "AI analyzes your writing structure, grammar, and coherence — showing exactly what to fix and why." },
  { icon: Mic, title: "Speaking Pronunciation Coach", description: "Get feedback on fluency, pronunciation, and natural expression to sound confident on exam day." },
  { icon: Calendar, title: "Personalized Study Plans", description: "AI builds a weekly plan based on your weak points, available time, and target exam date." },
  { icon: Target, title: "Weakness-Targeted Drills", description: "Smart recommendations focus your practice on the skills that need the most improvement." },
];

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  tagline: string;
  badge?: string;
  badgeColor?: string;
  highlighted?: boolean;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Build your foundation at no cost.",
    features: [
      "Basic vocabulary lists",
      "Sample practice exercises",
      "Limited daily questions",
      "Self-graded answer keys",
    ],
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "per month",
    tagline: "Best for serious weekly prep.",
    badge: "Most Popular",
    badgeColor: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]",
    highlighted: true,
    features: [
      "Everything in Free",
      "AI-powered writing corrections",
      "2 full-length mock exams",
      "Personalized AI study plans",
      "Progress analytics dashboard",
    ],
  },
  {
    name: "Max",
    price: "$29.99",
    period: "per month",
    tagline: "Total exam readiness, unlimited.",
    badge: "Mastery Class",
    badgeColor: "bg-[#EEEFFC] text-[#4A55A2] border-[#DDE0FA]",
    features: [
      "Everything in Pro",
      "Unlimited mock exams",
      "Unlimited speaking simulations",
      "AI speaking pronunciation coach",
      "Priority AI response channels",
    ],
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  context: string;
  color: string;
  bgColor: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Frensify made my TEF prep feel organized for the first time. The writing feedback was incredibly helpful.",
    name: "Amira B.",
    initials: "AB",
    context: "TEF C1 — Immigration Canada",
    color: "#2D6A53",
    bgColor: "#EAF5F1",
  },
  {
    quote: "The AI speaking practice helped me stop overthinking and start answering more naturally and confidently.",
    name: "Lucas M.",
    initials: "LM",
    context: "TCF B2 — University Admission",
    color: "#1D74B4",
    bgColor: "#E8F3FC",
  },
  {
    quote: "I finally had a study plan that matched my schedule and weak areas. The mock exams felt like the real thing.",
    name: "Sofia R.",
    initials: "SR",
    context: "TEF B2 — Professional Goals",
    color: "#B83E5C",
    bgColor: "#FCECF0",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is the difference between TEF and TCF?",
    answer: "TEF (Test d'évaluation de français) and TCF (Test de connaissance du français) are both standardized French proficiency exams. TEF is administered by the Paris Chamber of Commerce and is widely accepted for Canadian immigration. TCF is administered by France Éducation International and is commonly used for French university admission and residency applications. Frensify prepares you for both.",
  },
  {
    question: "How does AI feedback work for writing and speaking?",
    answer: "Our AI engine analyzes your writing submissions for grammar, structure, coherence, and exam-specific criteria, then provides targeted corrections with explanations. For speaking, the AI evaluates your recorded responses for fluency, pronunciation, and natural expression, offering specific suggestions to improve your delivery.",
  },
  {
    question: "Can I switch between TEF and TCF preparation?",
    answer: "Yes. When you create your account, you select a target exam, but you can switch between TEF and TCF preparation at any time from your account settings. Both exam paths share foundational skills while offering exam-specific practice materials.",
  },
  {
    question: "How realistic are the mock exams?",
    answer: "Our mock exams mirror the official TEF and TCF format, timing, and difficulty level. Each simulation covers all four modules — listening, reading, writing, and speaking — under real exam conditions so the actual test feels familiar.",
  },
  {
    question: "What CEFR level do I need for Canadian immigration?",
    answer: "Most Canadian immigration programs require a minimum of CLB 7 (equivalent to CEFR B2) across all four skills. Some programs like Express Entry award additional points for higher scores. Frensify tracks your estimated CEFR level and helps you understand where you stand relative to your target.",
  },
  {
    question: "Is there a free trial for Pro or Max?",
    answer: "The Free plan gives you permanent access to basic vocabulary, sample exercises, and limited daily practice. This lets you experience the platform before upgrading. Pro and Max subscriptions can be cancelled anytime with no long-term commitment.",
  },
];
