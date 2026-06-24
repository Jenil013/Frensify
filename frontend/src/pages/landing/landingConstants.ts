import { Headphones, BookOpen, Mic, PenTool, Target, TrendingUp, MapPin, GraduationCap, Briefcase, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Feature Modules ──────────────────────────────────────────────────────────

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
    description:
      "Understand real-world French conversations, workplace dialogue, and exam audio at full speed, with zero hesitation.",
    icon: Headphones,
    color: "#2D6A53",
    bgColor: "#EAF5F1",
    borderColor: "#D1EBE1",
  },
  {
    id: "reading",
    labelFr: "Compréhension Écrite",
    labelEn: "Reading",
    description:
      "Read government forms, workplace documents, and academic French with the speed and confidence immigration officers expect.",
    icon: BookOpen,
    color: "#9A5013",
    bgColor: "#FDF3E7",
    borderColor: "#FCE1CA",
  },
  {
    id: "speaking",
    labelFr: "Expression Orale",
    labelEn: "Speaking",
    description:
      "Communicate naturally in interviews, oral exams, and everyday Canadian life, with AI feedback on every response.",
    icon: Mic,
    color: "#B83E5C",
    bgColor: "#FCECF0",
    borderColor: "#F8D4DE",
  },
  {
    id: "writing",
    labelFr: "Expression Écrite",
    labelEn: "Writing",
    description:
      "Write immigration letters, academic submissions, and professional French that clears every exam rubric.",
    icon: PenTool,
    color: "#1D74B4",
    bgColor: "#E8F3FC",
    borderColor: "#D2E7F6",
  },
];

// ─── Journey Steps ────────────────────────────────────────────────────────────

export interface JourneyStep {
  level: string;
  title: string;
  description: string;
  milestone?: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    level: "A1",
    title: "Beginner",
    description: "Build your first real French sentences. Discover the rhythm and structure of the language.",
    milestone: "Starting point",
  },
  {
    level: "A2",
    title: "Foundation",
    description: "Hold basic conversations, understand common phrases, and start reading simple French text.",
    milestone: "Everyday survival French",
  },
  {
    level: "B1",
    title: "Intermediate",
    description: "Express yourself on familiar topics. Understand workplace and educational French with confidence.",
    milestone: "B1 band",
  },
  {
    level: "B2",
    title: "Exam Ready",
    description: "Handle complex French across all four exam modules. Simulate real TEF and TCF conditions.",
    milestone: "B2 target",
  },
  {
    level: "B2",
    title: "Immigration Score",
    description: "Achieve the language benchmark recognized by IRCC. Maximize your Express Entry CRS score.",
    milestone: "Express Entry eligible",
  },
  {
    level: "🇨🇦",
    title: "Canada",
    description: "Your Canadian future begins. PR invitation, university admission, or bilingual career, your goal, unlocked.",
    milestone: "Destination reached",
  },
];

// ─── AI Features ──────────────────────────────────────────────────────────────

export interface AIFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const AI_FEATURES: AIFeature[] = [
  {
    icon: Target,
    title: "Detects Score-Limiting Mistakes",
    description:
      "Pinpoints the exact errors holding your score back, grammar patterns, structure gaps, and pronunciation habits that cost you points.",
  },
  {
    icon: TrendingUp,
    title: "Predicts Your Exam Readiness",
    description:
      "Tracks your performance across all four modules and tells you, in CEFR terms, exactly how close you are to your immigration target.",
  },
  {
    icon: MapPin,
    title: "Surfaces Your Next Best Practice",
    description:
      "Your dashboard highlights the module furthest from your CEFR target and points you to the highest-impact timed session to run next.",
  },
];

// ─── Why French for Canada ────────────────────────────────────────────────────

export interface CanadaReason {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export const CANADA_REASONS: CanadaReason[] = [
  {
    icon: MapPin,
    title: "Immigration",
    description:
      "Earn additional CRS points through proven French language ability. Strengthen your Express Entry profile and improve your chances of receiving a PR invitation.",
    color: "#2346D8",
    bgColor: "#EEF3FF",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description:
      "Meet the language requirements for Canadian universities and colleges. Open doors to French-language programs, scholarships, and institutions across the country.",
    color: "#2D6A53",
    bgColor: "#EAF5F1",
  },
  {
    icon: Briefcase,
    title: "Career",
    description:
      "Access bilingual job opportunities across federal government, healthcare, finance, and tech. Bilingual candidates earn more and advance faster in the Canadian job market.",
    color: "#9A5013",
    bgColor: "#FDF3E7",
  },
  {
    icon: Home,
    title: "Quebec & Francophone Communities",
    description:
      "Prepare for life, work, and integration in Quebec and other French-speaking regions. Speak the language of the community you're joining, not just the exam.",
    color: "#B83E5C",
    bgColor: "#FCECF0",
  },
];

// ─── Pricing Tiers ────────────────────────────────────────────────────────────

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
    tagline: "Explore Frensify before you commit.",
    features: [
      "2 sample Listening tests",
      "2 sample Reading tests",
      "Basic vocabulary practice",
    ],
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "per month",
    tagline: "The plan serious candidates choose.",
    badge: "Most Popular",
    badgeColor: "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]",
    highlighted: true,
    features: [
      "1 full mock simulation per week",
      "2 Writing practice drills per week",
      "2 Speaking practice drills per week",
      "Unlimited Listening and Reading simulations",
      "AI-powered Writing and Speaking corrections",
      "Full AI feedback on mock exams",
      "CEFR progress tracking dashboard",
      "Next-best practice recommendations",
    ],
  },
  {
    name: "Max",
    price: "$29.99",
    period: "per month",
    tagline: "Everything you need to reach B2.",
    badge: "Full Readiness",
    badgeColor: "bg-[#EEEFFC] text-[#4A55A2] border-[#DDE0FA]",
    features: [
      "Everything in Pro",
      "2 full mock simulations per week",
      "4 Writing practice drills per week",
      "4 Speaking practice drills per week",
    ],
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  context: string;
  result: string;
  resultDetail: string;
  color: string;
  bgColor: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I went from failing my TEF practice tests to receiving my PR invitation. Frensify's AI drills showed me exactly which writing patterns were costing me exam points, and fixed them.",
    name: "Khushbu T.",
    initials: "KT",
    context: "TEF Canada · Express Entry",
    result: "A2 → B2",
    resultDetail: "+43 CRS Points",
    color: "#2D6A53",
    bgColor: "#EAF5F1",
  },
  {
    quote:
      "My university admission required B2. Frensify's mock exams felt identical to the real TCF, by exam day, I wasn't nervous. I was ready.",
    name: "Ana M.",
    initials: "AM",
    context: "TCF · University Admission",
    result: "B1 → B2",
    resultDetail: "Accepted to Canadian University",
    color: "#1D74B4",
    bgColor: "#E8F3FC",
  },
  {
    quote:
      "The speaking feedbacks identified my accent patterns and gave me specific fixes, not generic advice. PR invitation within few months.",
    name: "Karim A.",
    initials: "KA",
    context: "TEF Canada · Permanent Residency",
    result: "+50 PR Points",
    resultDetail: "PR Invitation Received",
    color: "#B83E5C",
    bgColor: "#FCECF0",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is the difference between TEF and TCF?",
    answer:
      "TEF (Test d'évaluation de français) and TCF (Test de connaissance du français) are both standardized French proficiency exams accepted by IRCC for Canadian immigration. TEF is administered by the Paris Chamber of Commerce; TCF by France Éducation International. Both are widely used for Express Entry, university admission, and provincial nominee programs. Frensify prepares you for both.",
  },
  {
    question: "How many CRS points can French language scores add?",
    answer:
      "Strong French scores can add significant CRS points to your Express Entry profile. B2 or higher in French, combined with an English score, can add up to 50 additional points for bilingualism alone. For candidates applying through French-language streams, the impact can be even greater. Frensify tracks your estimated CEFR level so you always know where you stand.",
  },
  {
    question: "How does AI feedback work for writing and speaking?",
    answer:
      "Our AI engine analyzes your writing for grammar, structure, coherence, and exam-specific rubric criteria, then provides targeted corrections with clear explanations. For speaking, it evaluates your recorded responses for fluency, pronunciation, and natural expression. Every correction is tied to specific CEFR criteria, not generic tips.",
  },
  {
    question: "Can I switch between TEF and TCF preparation?",
    answer:
      "Yes. You select a target exam when you create your account, but can switch between TEF and TCF at any time from your settings. Both paths share foundational skill-building while offering exam-specific practice materials and mock formats.",
  },
  {
    question: "How realistic are the mock exams?",
    answer:
      "Our mock exams mirror the official TEF and TCF format, timing, and difficulty level precisely. Each simulation covers all four modules, listening, reading, writing, and speaking, under real exam conditions, so the actual test day feels familiar, not frightening.",
  },
  {
    question: "What CEFR level do I need for Canadian immigration?",
    answer:
      "Most Federal Skilled Worker and Express Entry programs require a minimum of B2 in all four skills. Higher scores, C1 or above, can earn substantially more CRS points. Frensify tracks your CEFR estimate continuously so you always know your standing relative to your immigration target.",
  },
  {
    question: "Is there a free trial for Pro or Max?",
    answer:
      "The Free plan gives you permanent access to a placement test, sample exercises, and limited daily practice, enough to understand your starting point before committing. Pro and Max subscriptions are month-to-month and can be cancelled anytime with no penalty.",
  },
];
