import { McqItem, TcfModuleDefinition, TcfModuleId } from "./types";

/** Official TCF module metadata (content loaded via questionBank service). */
export const TCF_MODULE_REGISTRY: Record<TcfModuleId, TcfModuleDefinition> = {
  "comprehension-ecrite": {
    meta: {
      id: "comprehension-ecrite",
      labelFr: "Compréhension écrite",
      labelEn: "Reading comprehension",
      objective:
        "Measure your ability to read and understand written documents.",
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
        "Measure your ability to understand spoken French by listening to audio documents.",
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
      objective: "Measure your ability to express yourself in written French.",
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
        "Measure your ability to communicate orally with an interlocutor.",
      durationMinutes: 15,
      format: "sections",
      scoring: "ai-rubric",
      sections: [
        {
          id: "A",
          label: "Section A — Obtaining information",
          durationMinutes: 5,
          taskType: "oral-response",
        },
        {
          id: "B",
          label: "Section B — Convincing argument",
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
  40
);

export const PLACEHOLDER_LISTENING_QUESTIONS = expandMcqBank(
  LISTENING_TEMPLATES,
  "listening",
  40
);

export const TCF_MODULE_ORDER: TcfModuleId[] = [
  "comprehension-ecrite",
  "comprehension-orale",
  "expression-ecrite",
  "expression-orale",
];

export function getModuleLabel(moduleId: TcfModuleId): string {
  return TCF_MODULE_REGISTRY[moduleId].meta.labelFr;
}
