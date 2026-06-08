import type { TcfExpressionSection } from "../types";

const TASK1_INTRO_FR =
  "Présentez-vous : dites votre nom, votre âge, d'où vous venez et parlez un peu de votre famille.";

const TASK1_FOLLOWUPS: { id: string; fr: string; en: string }[] = [
  {
    id: "work",
    fr: "Que faites-vous dans la vie ? Parlez de votre travail actuel, de vos études ou de vos activités quotidiennes.",
    en: "Work & studies — describe your job, studies, or daily tasks.",
  },
  {
    id: "routine",
    fr: "Décrivez-moi une journée type : à quelle heure vous vous levez, vous travaillez, vous mangez, etc.",
    en: "Daily routine — walk through a typical day.",
  },
  {
    id: "hobbies",
    fr: "Qu'aimez-vous faire pendant votre temps libre ? Quel est votre livre ou votre film préféré ?",
    en: "Hobbies & interests — free time and favorites.",
  },
  {
    id: "travel",
    fr: "Où êtes-vous parti(e) lors de vos dernières vacances ? Parlez-moi d'un voyage récent.",
    en: "Travel — describe a recent trip or vacation.",
  },
  {
    id: "future",
    fr: "Où vous imaginez-vous dans trente ans ? Pourquoi souhaitez-vous immigrer au Canada ?",
    en: "Future / Canada — long-term plans and immigration motivation.",
  },
];

const TASK1_BASE_PROMPT =
  "Structured interview (2 min). The examiner will first ask you to introduce yourself, then ask a follow-up question. Answer naturally in complete sentences.";

export function buildRandomTcfTask1Section(): TcfExpressionSection {
  const followup =
    TASK1_FOLLOWUPS[Math.floor(Math.random() * TASK1_FOLLOWUPS.length)];
  return {
    stimulus: `${TASK1_INTRO_FR}\n\n${followup.fr}`,
    prompt: `${TASK1_BASE_PROMPT} Follow-up topic: ${followup.en}`,
  };
}
