import { McqItem, TcfModuleDefinition, TcfModuleId } from "./types";

/** Official TCF module metadata (content loaded via questionBank service). */
export const TCF_MODULE_REGISTRY: Record<TcfModuleId, TcfModuleDefinition> = {
  "comprehension-orale": {
    meta: {
      id: "comprehension-orale",
      labelFr: "Compréhension orale",
      labelEn: "Listening comprehension",
      objective:
        "Audio clips ranging from simple daily announcements to complex academic or professional discussions.",
      durationMinutes: 35,
      questionCount: 39,
      format: "mcq",
      scoring: "+1/0",
    },
  },
  "comprehension-ecrite": {
    meta: {
      id: "comprehension-ecrite",
      labelFr: "Compréhension écrite",
      labelEn: "Reading comprehension",
      objective:
        "Short messages, visual signs, newspaper articles, and literary excerpts.",
      durationMinutes: 60,
      questionCount: 39,
      format: "mcq",
      scoring: "+1/0",
    },
  },
  "expression-ecrite": {
    meta: {
      id: "expression-ecrite",
      labelFr: "Expression écrite",
      labelEn: "Written expression",
      objective:
        "Three progressive writing exercises testing your ability to compose in French.",
      durationMinutes: 60,
      format: "sections",
      scoring: "ai-rubric",
      sections: [
        {
          id: "1",
          label: "Tâche 1 — Short message (60–120 words)",
          durationMinutes: 15,
          minWords: 60,
          maxWords: 120,
          taskType: "essay",
        },
        {
          id: "2",
          label: "Tâche 2 — Report or story (120–150 words)",
          durationMinutes: 20,
          minWords: 120,
          maxWords: 150,
          taskType: "essay",
        },
        {
          id: "3",
          label: "Tâche 3 — Comparative argument (120–180 words)",
          durationMinutes: 25,
          minWords: 120,
          maxWords: 180,
          taskType: "essay",
        },
      ],
    },
    sections: {
      "1": {
        prompt:
          "Write a short message to a friend inviting them to an event you are organizing. Include the date, time, location, and what they should bring. (60–120 words)",
        stimulus:
          "Vous organisez une fête de quartier ce samedi. Écrivez un message à votre ami(e) pour l'inviter.",
      },
      "2": {
        prompt:
          "Write a report about a recent event you attended, describing what happened and your impressions. (120–150 words)",
        stimulus:
          "Vous avez assisté à un salon du livre dans votre ville. Rédigez un compte-rendu de cet événement pour le journal de votre école.",
      },
      "3": {
        prompt:
          "Some people believe remote work is the future, while others think office work is essential. Compare both views and argue your own position. (120–180 words)",
        stimulus:
          "Le télétravail divise l'opinion publique. Certains y voient une révolution positive, d'autres un danger pour la cohésion sociale. Comparez ces deux points de vue et exprimez votre opinion.",
      },
    },
  },
  "expression-orale": {
    meta: {
      id: "expression-orale",
      labelFr: "Expression orale",
      labelEn: "Oral expression",
      objective:
        "Three progressively difficult oral tasks: structured interview, role-play, and argumentative response.",
      durationMinutes: 12,
      format: "sections",
      scoring: "ai-rubric",
      sections: [
        {
          id: "1",
          label: "Tâche 1 — Structured interview (2 min)",
          durationMinutes: 2,
          taskType: "oral-response",
        },
        {
          id: "2",
          label: "Tâche 2 — Role-play with preparation (5.5 min)",
          durationMinutes: 6,
          taskType: "oral-response",
        },
        {
          id: "3",
          label: "Tâche 3 — Argumentative response (4.5 min)",
          durationMinutes: 5,
          taskType: "oral-response",
        },
      ],
    },
    sections: {
      "1": {
        prompt:
          "The examiner will ask you questions about yourself: your hobbies, your studies, your daily routine. Answer naturally and in complete sentences. (2 minutes)",
        stimulus:
          "Présentez-vous : parlez de votre quotidien, de vos loisirs et de vos projets.",
      },
      "2": {
        prompt:
          "You want to enroll in a French language course at a local cultural center. Call the center to get information about schedules, prices, and requirements. (5.5 minutes including preparation)",
        stimulus:
          "Annonce : Centre culturel francophone — Cours de français tous niveaux, du lundi au vendredi. Inscriptions ouvertes. Contactez-nous pour plus d'informations.",
      },
      "3": {
        prompt:
          "Some people think social media should be banned for children under 16. Express and defend your opinion on this topic without preparation. (4.5 minutes)",
        stimulus:
          "Sujet : Faut-il interdire les réseaux sociaux aux moins de 16 ans ?",
      },
    },
  },
};

const READING_TEMPLATES: Omit<McqItem, "id">[] = [
  {
    prompt: "Quelle est la position principale défendue dans l'analyse ?",
    passage: `L'ère post-pandémique a propulsé le travail à distance au rang de norme opérationnelle. Néanmoins, cette flexibilité tant louée s'avère être une lame à double tranchant. Si les salariés y trouvent un répit évident face aux trajets laborieux, de nombreuses entreprises signalent une érosion préoccupante de l'esprit d'équipe. Il convient de se demander s'il ne faut pas légiférer rapidement pour imposer un strict équilibre hybride.`,
    choices: [
      "A) Interdire complètement le télétravail.",
      "B) Encadrer législativement le modèle hybride.",
      "C) Le télétravail a entièrement échoué.",
      "D) Féliciter l'érosion de la cohésion sociale.",
    ],
    correctChoiceIndex: 1,
    explanation: "Le texte propose une législation pour un équilibre hybride.",
  },
  {
    prompt: "Quelle nuance l'auteur souligne-t-il concernant l'écotourisme rural ?",
    passage: `Face au flux de touristes saturant les capitales européennes, de nouveaux forfaits écotouristiques ruraux ont fleuri. Toutefois, l'arrivée désordonnée d'activités sportives motorisées suscite le scepticisme des résidents historiques, inquiets face aux atteintes portées à la tranquillité de la faune endémique.`,
    choices: [
      "A) Accueil unanime des attractions motorisées.",
      "B) Réactions uniquement positives.",
      "C) Frictions entre revitalisation économique et stabilité écologique.",
      "D) Encouragement des camping-cars en capitale.",
    ],
    correctChoiceIndex: 2,
    explanation: "Conflit entre manne financière et inquiétudes écologiques.",
  },
];

const LISTENING_TEMPLATES: Omit<McqItem, "id">[] = [
  {
    prompt: "Pourquoi l'appelant laisse-t-il ce message ?",
    transcript:
      "Bonjour, c'est Alain de la réception technique. Je vous contacte au sujet du dysfonctionnement du système de climatisation. L'ingénieur passera entre 14h et 16h; merci de veiller à ce que l'accès au compteur principal soit dégagé.",
    choices: [
      "A) Annuler un rendez-vous.",
      "B) Demander de dégager l'accès au compteur.",
      "C) Signaler une réparation terminée.",
      "D) Se plaindre de la canicule.",
    ],
    correctChoiceIndex: 1,
    explanation: "Alain demande de dégager l'accès au compteur pour l'ingénieur.",
  },
  {
    prompt: "Quel obstacle principal à l'acceptation des insectes est mentionné ?",
    transcript:
      "Faut-il voir dans l'insecte l'avenir de nos apports protéiques ? L'acceptabilité sociale peine à décoller, en dépit du bilan carbone sobre, entre dégoût culturel et réticence de la filière porcine.",
    choices: [
      "A) Adoption massive en France.",
      "B) Barrières culturelles et professionnelles.",
      "C) Interdiction par l'Union européenne.",
      "D) Financement de pâtisseries aux grillons.",
    ],
    correctChoiceIndex: 1,
    explanation: "Dégoût culturel et réticence de la filière porcine.",
  },
];

function expandMcqBank(
  templates: Omit<McqItem, "id">[],
  prefix: string,
  count: number
): McqItem[] {
  return Array.from({ length: count }, (_, i) => {
    const t = templates[i % templates.length];
    return {
      ...t,
      id: `${prefix}-q${i + 1}`,
      prompt: `[Question ${i + 1}/40] ${t.prompt}`,
    };
  });
}

/** Placeholder banks until Supabase content is wired. */
export const PLACEHOLDER_READING_QUESTIONS = expandMcqBank(
  READING_TEMPLATES,
  "reading",
  39
);

export const PLACEHOLDER_LISTENING_QUESTIONS = expandMcqBank(
  LISTENING_TEMPLATES,
  "listening",
  39
);

export const TCF_MODULE_ORDER: TcfModuleId[] = [
  "comprehension-orale",
  "comprehension-ecrite",
  "expression-ecrite",
  "expression-orale",
];

export function getModuleLabel(moduleId: TcfModuleId): string {
  return TCF_MODULE_REGISTRY[moduleId].meta.labelFr;
}
