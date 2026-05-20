/**
 * TEF (Test d'Évaluation de Français) — CEFR competency grid and
 * TEF Canada (/699) score ↔ NCLC equivalences (IRCC chart, tests after Dec 2023).
 */

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TefSkillId =
  | "comprehension-orale"
  | "comprehension-ecrite"
  | "expression-orale"
  | "expression-ecrite";

export interface TefSkillMeta {
  id: TefSkillId;
  labelFr: string;
  labelEn: string;
  icon: "listening" | "reading" | "speaking" | "writing";
}

export const TEF_SKILLS: TefSkillMeta[] = [
  {
    id: "comprehension-orale",
    labelFr: "Compréhension orale",
    labelEn: "Oral comprehension",
    icon: "listening",
  },
  {
    id: "comprehension-ecrite",
    labelFr: "Compréhension écrite",
    labelEn: "Written comprehension",
    icon: "reading",
  },
  {
    id: "expression-orale",
    labelFr: "Expression orale",
    labelEn: "Oral production",
    icon: "speaking",
  },
  {
    id: "expression-ecrite",
    labelFr: "Expression écrite",
    labelEn: "Written production",
    icon: "writing",
  },
];

/** CEFR competency descriptors (TEF official grid). */
export const TEF_CEFR_DESCRIPTOR_GRID: Record<
  CefrLevel,
  Record<TefSkillId, string>
> = {
  A1: {
    "comprehension-orale":
      "You can understand familiar words and expressions if people speak clearly and slowly.",
    "comprehension-ecrite":
      "You can understand simple sentences like on an ad, poster or catalog.",
    "expression-orale":
      "You can communicate in a simple way on familiar topics. You can use simple sentences to describe your immediate environment.",
    "expression-ecrite": "You can write small and simple texts.",
  },
  A2: {
    "comprehension-orale":
      "You can understand simple and clear messages; frequently used words and expressions about your family, shopping, work or yourself.",
    "comprehension-ecrite":
      "You can understand simple and short texts. You can find information in documents such as advertisements, flyers, menus, schedules.",
    "expression-orale":
      "You can exchange simple and direct information on familiar topics.",
    "expression-ecrite": "You can write short and simple messages.",
  },
  B1: {
    "comprehension-orale":
      "You can understand the main points of clear standard speech on familiar topics such as work, school, hobbies, etc. You can understand the general ideas of radio and television programs on the news if spoken clearly.",
    "comprehension-ecrite":
      "You can understand texts in everyday and work-related language. You can understand descriptions of events, expressions of feelings and wishes in personal letters.",
    "expression-orale":
      "You can communicate without preparation on familiar subjects. You can share your experiences, plans, hopes and give brief explanations. You can tell a short story with some details.",
    "expression-ecrite":
      "You can write a simple and coherent text on familiar topics. You can describe your experiences and impressions in a letter.",
  },
  B2: {
    "comprehension-orale":
      "You can understand long speeches and follow complex arguments on familiar topics. You can understand most news programs, radio features, etc.",
    "comprehension-ecrite":
      "You can read argumentative press articles on general themes.",
    "expression-orale":
      "You can communicate with spontaneity and a certain ease. You can present and defend your opinions, explain the pros and cons of a topic.",
    "expression-ecrite":
      "You can write clear and detailed texts on a variety of topics related to your interests. You can communicate information and express your opinion in writing.",
  },
  C1: {
    "comprehension-orale":
      "You can understand long speeches or interviews with varying degrees of structure and meaning. You can understand most television and radio programs.",
    "comprehension-ecrite":
      "You can understand long and complex texts of different styles. You can understand specialized articles in your field.",
    "expression-orale":
      "You can express yourself spontaneously and fluently. You can express your ideas and opinions and relate them to those of others.",
    "expression-ecrite":
      "You can write structured texts and develop your point of view on complex subjects in a letter, an essay, a report. You can adapt your style to the recipient.",
  },
  C2: {
    "comprehension-orale":
      "You can understand spoken language and any type of audio material without difficulty. (Provided you have time to familiarize yourself with a particular accent).",
    "comprehension-ecrite":
      "You can read any type of text, both abstract and complex, such as a specialized article or a literary work.",
    "expression-orale":
      "You can converse effortlessly and are comfortable with common phrases and expressions. You can express fine nuances of meaning and present logical, easy-to-follow speech.",
    "expression-ecrite":
      "You can write a clear and fluid text with an adapted style. You have an effective style, completely adapted to the recipient and the situation.",
  },
};

/** TEF Canada section score bands (out of 699) → NCLC + CECR. */
export interface TefScoreBand {
  scoreMin: number;
  scoreMax: number;
  nclc: number;
  cefr: CefrLevel;
}

export const TEF_CANADA_SCORE_BANDS: Record<TefSkillId, TefScoreBand[]> = {
  "comprehension-ecrite": [
    { scoreMin: 0, scoreMax: 341, nclc: 0, cefr: "A1" },
    { scoreMin: 342, scoreMax: 374, nclc: 4, cefr: "A2" },
    { scoreMin: 375, scoreMax: 405, nclc: 5, cefr: "B1" },
    { scoreMin: 406, scoreMax: 432, nclc: 6, cefr: "B1" },
    { scoreMin: 433, scoreMax: 461, nclc: 7, cefr: "B2" },
    { scoreMin: 462, scoreMax: 502, nclc: 8, cefr: "B2" },
    { scoreMin: 503, scoreMax: 545, nclc: 9, cefr: "C1" },
    { scoreMin: 546, scoreMax: 580, nclc: 10, cefr: "C1" },
    { scoreMin: 581, scoreMax: 699, nclc: 12, cefr: "C2" },
  ],
  "comprehension-orale": [
    { scoreMin: 0, scoreMax: 330, nclc: 0, cefr: "A1" },
    { scoreMin: 331, scoreMax: 368, nclc: 4, cefr: "A2" },
    { scoreMin: 369, scoreMax: 398, nclc: 5, cefr: "B1" },
    { scoreMin: 399, scoreMax: 428, nclc: 6, cefr: "B1" },
    { scoreMin: 429, scoreMax: 458, nclc: 7, cefr: "B2" },
    { scoreMin: 459, scoreMax: 494, nclc: 8, cefr: "B2" },
    { scoreMin: 495, scoreMax: 527, nclc: 9, cefr: "C1" },
    { scoreMin: 528, scoreMax: 562, nclc: 10, cefr: "C1" },
    { scoreMin: 563, scoreMax: 699, nclc: 12, cefr: "C2" },
  ],
  "expression-ecrite": [
    { scoreMin: 0, scoreMax: 267, nclc: 0, cefr: "A1" },
    { scoreMin: 268, scoreMax: 329, nclc: 4, cefr: "A2" },
    { scoreMin: 330, scoreMax: 359, nclc: 5, cefr: "B1" },
    { scoreMin: 360, scoreMax: 389, nclc: 6, cefr: "B2" },
    { scoreMin: 390, scoreMax: 419, nclc: 7, cefr: "B2" },
    { scoreMin: 420, scoreMax: 449, nclc: 8, cefr: "B2" },
    { scoreMin: 450, scoreMax: 479, nclc: 9, cefr: "C1" },
    { scoreMin: 480, scoreMax: 507, nclc: 10, cefr: "C1" },
    { scoreMin: 508, scoreMax: 699, nclc: 12, cefr: "C2" },
  ],
  "expression-orale": [
    { scoreMin: 0, scoreMax: 327, nclc: 0, cefr: "A1" },
    { scoreMin: 328, scoreMax: 357, nclc: 4, cefr: "A2" },
    { scoreMin: 358, scoreMax: 387, nclc: 5, cefr: "B1" },
    { scoreMin: 388, scoreMax: 417, nclc: 6, cefr: "B1" },
    { scoreMin: 418, scoreMax: 447, nclc: 7, cefr: "B2" },
    { scoreMin: 448, scoreMax: 487, nclc: 8, cefr: "B2" },
    { scoreMin: 488, scoreMax: 515, nclc: 9, cefr: "C1" },
    { scoreMin: 516, scoreMax: 548, nclc: 10, cefr: "C1" },
    { scoreMin: 549, scoreMax: 699, nclc: 12, cefr: "C2" },
  ],
};

/** Minimum TEF Canada (/699) scores per skill to reach a CEFR target (Express Entry–aligned). */
export const TEF_CEFR_SKILL_TARGETS: Record<
  CefrLevel,
  Record<TefSkillId, { scoreMin: number; nclc: number }>
> = {
  A1: {
    "comprehension-orale": { scoreMin: 0, nclc: 0 },
    "comprehension-ecrite": { scoreMin: 0, nclc: 0 },
    "expression-orale": { scoreMin: 0, nclc: 0 },
    "expression-ecrite": { scoreMin: 0, nclc: 0 },
  },
  A2: {
    "comprehension-orale": { scoreMin: 331, nclc: 4 },
    "comprehension-ecrite": { scoreMin: 342, nclc: 4 },
    "expression-orale": { scoreMin: 328, nclc: 4 },
    "expression-ecrite": { scoreMin: 268, nclc: 4 },
  },
  B1: {
    "comprehension-orale": { scoreMin: 369, nclc: 5 },
    "comprehension-ecrite": { scoreMin: 375, nclc: 5 },
    "expression-orale": { scoreMin: 358, nclc: 5 },
    "expression-ecrite": { scoreMin: 330, nclc: 5 },
  },
  B2: {
    "comprehension-orale": { scoreMin: 429, nclc: 7 },
    "comprehension-ecrite": { scoreMin: 433, nclc: 7 },
    "expression-orale": { scoreMin: 418, nclc: 7 },
    "expression-ecrite": { scoreMin: 390, nclc: 7 },
  },
  C1: {
    "comprehension-orale": { scoreMin: 495, nclc: 9 },
    "comprehension-ecrite": { scoreMin: 503, nclc: 9 },
    "expression-orale": { scoreMin: 488, nclc: 9 },
    "expression-ecrite": { scoreMin: 450, nclc: 9 },
  },
  C2: {
    "comprehension-orale": { scoreMin: 563, nclc: 12 },
    "comprehension-ecrite": { scoreMin: 581, nclc: 12 },
    "expression-orale": { scoreMin: 549, nclc: 12 },
    "expression-ecrite": { scoreMin: 508, nclc: 12 },
  },
};

export const TEF_CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const TEF_TARGET_OPTIONS: {
  value: CefrLevel;
  label: string;
  subtitle: string;
  canadaNote?: string;
}[] = [
  {
    value: "A1",
    label: "A1 — Breakthrough",
    subtitle: "Débutant · Basic survival French",
  },
  {
    value: "A2",
    label: "A2 — Waystage",
    subtitle: "Élémentaire · NCLC 4 baseline",
    canadaNote: "Below most immigration thresholds",
  },
  {
    value: "B1",
    label: "B1 — Threshold",
    subtitle: "Intermédiaire · NCLC 5–6",
    canadaNote: "Citizenship & some programs",
  },
  {
    value: "B2",
    label: "B2 — Vantage",
    subtitle: "Indépendant · NCLC 7+ (Express Entry)",
    canadaNote: "CRS French bonus · ~433–461+ per skill",
  },
  {
    value: "C1",
    label: "C1 — Effective Operational",
    subtitle: "Avancé · NCLC 9–10",
    canadaNote: "Maximum CRS French language points",
  },
  {
    value: "C2",
    label: "C2 — Mastery",
    subtitle: "Maîtrise · NCLC 12",
    canadaNote: "Near-native professional proficiency",
  },
];

export const CEFR_LEVEL_COLORS: Record<
  CefrLevel,
  { bg: string; text: string; arrow: string }
> = {
  A1: { bg: "bg-[#FCECF0]", text: "text-[#B83E5C]", arrow: "bg-[#E8A0B0]" },
  A2: { bg: "bg-[#FCECF0]", text: "text-[#B83E5C]", arrow: "bg-[#E8A0B0]" },
  B1: { bg: "bg-[#EBF3FC]", text: "text-[#1D74B4]", arrow: "bg-[#8BB8E8]" },
  B2: { bg: "bg-[#EBF3FC]", text: "text-[#1D74B4]", arrow: "bg-[#8BB8E8]" },
  C1: { bg: "bg-[#EEEFFC]", text: "text-[#4A55A2]", arrow: "bg-[#6B7BC4]" },
  C2: { bg: "bg-[#EEEFFC]", text: "text-[#4A55A2]", arrow: "bg-[#3D4A8C]" },
};

export const CEFR_LEVEL_ORDER: Record<CefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

export function parseCefrTarget(value: string): CefrLevel {
  const match = value.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
  if (match) return match[1].toUpperCase() as CefrLevel;
  if (TEF_CEFR_LEVELS.includes(value as CefrLevel)) return value as CefrLevel;
  return "B2";
}

export function getTefTargetLabel(cefr: CefrLevel): string {
  return TEF_TARGET_OPTIONS.find((o) => o.value === cefr)?.label ?? cefr;
}

export function scoreToBand(
  skillId: TefSkillId,
  score: number
): TefScoreBand | undefined {
  return TEF_CANADA_SCORE_BANDS[skillId].find(
    (b) => score >= b.scoreMin && score <= b.scoreMax
  );
}

export function cefrProgressPercent(
  current: CefrLevel,
  target: CefrLevel
): number {
  const cur = CEFR_LEVEL_ORDER[current];
  const tgt = CEFR_LEVEL_ORDER[target];
  if (tgt <= cur) return 100;
  return Math.round(((cur - 1) / (tgt - 1)) * 100);
}

export function getSkillLabel(skillId: TefSkillId): string {
  return TEF_SKILLS.find((s) => s.id === skillId)?.labelFr ?? skillId;
}

// --- TEF Module Registry & Question Bank ---

import type { McqItem, TefModuleDefinition, TefModuleId } from "./types";

export const TEF_MODULE_REGISTRY: Record<TefModuleId, TefModuleDefinition> = {
  "comprehension-ecrite": {
    meta: {
      id: "comprehension-ecrite",
      labelFr: "Compréhension écrite",
      labelEn: "Reading comprehension",
      objective:
        "Understand everyday documents, articles, emails, and notices. Navigate freely between questions.",
      durationMinutes: 60,
      questionCount: 40,
      format: "mcq",
      scoring: "+1/0",
    },
  },
  "comprehension-orale": {
    meta: {
      id: "comprehension-orale",
      labelFr: "Compréhension orale",
      labelEn: "Listening comprehension",
      objective:
        "Listen to conversations, news, and interviews and select the correct answer. Some longer clips are played twice.",
      durationMinutes: 40,
      questionCount: 40,
      format: "mcq",
      scoring: "+1/0",
    },
  },
  "expression-ecrite": {
    meta: {
      id: "expression-ecrite",
      labelFr: "Expression écrite",
      labelEn: "Written expression",
      objective: "Two writing tasks testing article continuation and argumentation skills.",
      durationMinutes: 60,
      format: "sections",
      scoring: "ai-rubric",
      sections: [
        {
          id: "A",
          label: "Section A — Article continuation",
          durationMinutes: 25,
          minWords: 80,
          taskType: "essay",
        },
        {
          id: "B",
          label: "Section B — Express and justify a viewpoint",
          durationMinutes: 35,
          minWords: 200,
          taskType: "essay",
        },
      ],
    },
    sections: {
      A: {
        prompt:
          "Write the continuation of the article below. (80 words minimum)",
        stimulus:
          "Les villes canadiennes investissent massivement dans les transports en commun. Néanmoins, la voiture demeure le mode de déplacement dominant dans de nombreux quartiers périphériques...",
      },
      B: {
        prompt:
          "Express and justify your point of view on the topic below. (200 words minimum)",
        stimulus:
          "Sujet : Faut-il interdire les voitures individuelles dans les centres-villes au profit exclusif des pistes cyclables ?",
      },
    },
  },
  "expression-orale": {
    meta: {
      id: "expression-orale",
      labelFr: "Expression orale",
      labelEn: "Oral expression",
      objective:
        "Two role-play situations with an examiner: information gathering and persuasion.",
      durationMinutes: 15,
      format: "sections",
      scoring: "ai-rubric",
      sections: [
        {
          id: "A",
          label: "Section A — Information gathering (5 min)",
          durationMinutes: 5,
          taskType: "oral-response",
        },
        {
          id: "B",
          label: "Section B — Persuasion/convincing (10 min)",
          durationMinutes: 10,
          taskType: "oral-response",
        },
      ],
    },
    sections: {
      A: {
        prompt:
          "You read an advertisement for evening pottery classes. Call the organizer to obtain key information (prices, schedule, materials, experience required, etc.).",
        stimulus:
          "Annonce : Cours de poterie et sculpture — mardi et jeudi 19h–21h. Matériel fourni. Débutants bienvenus.",
      },
      B: {
        prompt:
          "Your friend refuses to use the neighborhood book-sharing library. Convince them to participate and deposit three books by the end of the month.",
        stimulus:
          "Contexte : Une bibliothèque de rue gratuite a ouvert dans votre quartier.",
      },
    },
  },
};

const TEF_READING_TEMPLATES: Omit<McqItem, "id">[] = [
  {
    prompt: "Quel est le message principal de cette affiche ?",
    passage:
      "SOLDES D'ÉTÉ — Jusqu'à -50% sur toute la collection printemps-été. Offre valable du 25 juin au 19 juillet. Conditions en magasin.",
    choices: [
      "A) Le magasin ferme définitivement.",
      "B) Une réduction est proposée sur les articles de saison.",
      "C) Les soldes commencent en hiver.",
      "D) Les achats en ligne sont interdits.",
    ],
    correctChoiceIndex: 1,
    explanation:
      "L'affiche annonce des soldes d'été avec des réductions sur la collection printemps-été.",
  },
  {
    prompt:
      "Selon l'article, quel défi principal accompagne l'expansion des véhicules électriques ?",
    passage:
      "L'essor des voitures électriques est indéniable. Cependant, le réseau de bornes de recharge reste insuffisant dans les zones rurales, freinant l'adoption massive de cette technologie par les ménages éloignés des grands centres urbains.",
    choices: [
      "A) Le prix des véhicules électriques augmente.",
      "B) L'infrastructure de recharge est inadéquate en milieu rural.",
      "C) Les constructeurs cessent la production.",
      "D) Les consommateurs préfèrent les transports en commun.",
    ],
    correctChoiceIndex: 1,
    explanation:
      "Le texte souligne l'insuffisance du réseau de bornes de recharge en zone rurale.",
  },
];

const TEF_LISTENING_TEMPLATES: Omit<McqItem, "id">[] = [
  {
    prompt: "Pourquoi cette annonce est-elle diffusée ?",
    transcript:
      "Mesdames et messieurs, en raison d'un incident technique sur la ligne 4, le trafic est interrompu entre les stations Châtelet et Gare du Nord. Des bus de remplacement sont mis à votre disposition à la sortie de la station.",
    choices: [
      "A) Pour annoncer un nouveau service de bus.",
      "B) Pour informer d'une interruption de trafic sur le métro.",
      "C) Pour signaler la fermeture définitive d'une station.",
      "D) Pour promouvoir un abonnement de transport.",
    ],
    correctChoiceIndex: 1,
    explanation:
      "L'annonce informe les usagers d'une interruption de trafic due à un incident technique.",
  },
  {
    prompt: "Que recommande le médecin dans cet extrait ?",
    transcript:
      "Docteur Leroy : Je vous conseille de réduire votre consommation de sel et de pratiquer une activité physique régulière, au moins trente minutes par jour. Cela aura un effet positif sur votre tension artérielle.",
    choices: [
      "A) Manger plus de sel pour l'énergie.",
      "B) Réduire le sel et faire de l'exercice.",
      "C) Prendre des médicaments immédiatement.",
      "D) Arrêter de travailler pendant un mois.",
    ],
    correctChoiceIndex: 1,
    explanation:
      "Le médecin recommande de réduire le sel et de faire du sport régulièrement.",
  },
];

function expandTefMcqBank(
  templates: Omit<McqItem, "id">[],
  prefix: string,
  count: number
): McqItem[] {
  return Array.from({ length: count }, (_, i) => {
    const t = templates[i % templates.length];
    return {
      ...t,
      id: `${prefix}-q${i + 1}`,
      prompt: `[Question ${i + 1}/${count}] ${t.prompt}`,
    };
  });
}

export const TEF_PLACEHOLDER_READING_QUESTIONS = expandTefMcqBank(
  TEF_READING_TEMPLATES,
  "tef-reading",
  40
);

export const TEF_PLACEHOLDER_LISTENING_QUESTIONS = expandTefMcqBank(
  TEF_LISTENING_TEMPLATES,
  "tef-listening",
  40
);

export const TEF_MODULE_ORDER: TefModuleId[] = [
  "comprehension-ecrite",
  "comprehension-orale",
  "expression-ecrite",
  "expression-orale",
];

export function getTefModuleLabel(moduleId: TefModuleId): string {
  return TEF_MODULE_REGISTRY[moduleId].meta.labelFr;
}

/** Sample attestation row (from official TEF Canada result document). */
export const TEF_SAMPLE_ATTESTATION = [
  {
    skillId: "comprehension-ecrite" as TefSkillId,
    score: 459,
    oldScore: "230 / 300",
    cefr: "B2" as CefrLevel,
    nclc: 7,
  },
  {
    skillId: "comprehension-orale" as TefSkillId,
    score: 484,
    oldScore: "289 / 360",
    cefr: "B2" as CefrLevel,
    nclc: 8,
  },
  {
    skillId: "expression-ecrite" as TefSkillId,
    score: 415,
    oldScore: "299 / 450",
    cefr: "B2" as CefrLevel,
    nclc: 6,
  },
  {
    skillId: "expression-orale" as TefSkillId,
    score: 490,
    oldScore: "344 / 450",
    cefr: "B2" as CefrLevel,
    nclc: 7,
  },
];
