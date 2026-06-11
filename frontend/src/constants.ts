import { ExerciseItem, VocabularyCard } from "./types";

// Static premium vocabulary items for building the dashboard carousel & learning modules
export const INITIAL_VOCABULARY: VocabularyCard[] = [
  {
    id: "v1",
    word: "Néanmoins",
    translation: "Nevertheless / Nonetheless",
    category: "Cohesion/Connectors",
    difficulty: "B2",
    mastered: false
  },
  {
    id: "v2",
    word: "S'avérer",
    translation: "To turn out / prove to be",
    category: "Verbs of Logic",
    difficulty: "C1",
    mastered: false
  },
  {
    id: "v3",
    word: "Primordial",
    translation: "Crucial / Of paramount importance",
    category: "Adjectives",
    difficulty: "B2",
    mastered: false
  },
  {
    id: "v4",
    word: "Dorénavant",
    translation: "From now on / Henceforth",
    category: "Time Connectors",
    difficulty: "B2",
    mastered: false
  },
  {
    id: "v5",
    word: "Inéluctable",
    translation: "Unavoidable / Inevitable",
    category: "Adjectives",
    difficulty: "C1",
    mastered: false
  },
  {
    id: "v6",
    word: "Accroître",
    translation: "To increase / expand",
    category: "Verbs of Logic",
    difficulty: "B1",
    mastered: false
  },
  {
    id: "v7",
    word: "Se conformer",
    translation: "To bundle / comply with",
    category: "Grammar & Phrases",
    difficulty: "B2",
    mastered: false
  },
  {
    id: "v8",
    word: "Un atout majeur",
    translation: "A major asset/advantage",
    category: "Collocations",
    difficulty: "B2",
    mastered: false
  },
  {
    id: "v9",
    word: "Susciter",
    translation: "To provoke / trigger / generate",
    category: "Verbs of Logic",
    difficulty: "C1",
    mastered: false
  },
  {
    id: "v10",
    word: "Il convient de",
    translation: "It is appropriate / fitting to",
    category: "Grammar & Phrases",
    difficulty: "B2",
    mastered: false
  }
];

// Curated exercises across the 4 skills and split between TEF and TCF profiles
export const SAMPLE_EXERCISES: ExerciseItem[] = [
  // READINGS
  {
    id: "r1",
    examType: "TEF",
    skill: "reading",
    title: "Editorial: Le Télétravail en Question",
    difficulty: "B2 (Intermediate-Advanced)",
    durationMinutes: 12,
    prompt: "Lisez attentivement l'éditorial et déterminez l'opinion principale de la rédactrice quant à la régulation.",
    passage: `L'ère post-pandémique a propulsé le travail à distance au rang de norme opérationnelle. Néanmoins, cette flexibilité tant louée s'avère être une lame à double tranchant. Si les salariés y trouvent un répit évident face aux trajets laborieux, de nombreuses entreprises signalent une érosion préoccupante de l'esprit d'équipe. Il convient de se demander s'il ne faut pas légiférer rapidement pour imposer un strict équilibre hybride, au risque de voir la cohésion sociale de notre société s'étioler inéluctablement.`,
    questionType: "multiple-choice",
    choices: [
      "A) La rédactrice est contre tout type de télétravail.",
      "B) Elle prône une régulation juridique rigoureuse pour garantir un compromis hybride.",
      "C) Le télétravail a entièrement échoué selon l'éditorial.",
      "D) Elle félicite les salariés pour l'érosion de la cohésion sociale."
    ],
    correctChoiceIndex: 1,
    explanation: "Le texte mentionne 'il convient de se demander s'il ne faut pas légiférer rapidement pour imposer un strict équilibre hybride', ce qui correspond exactement à la proposition B (réguler).",
    isPremium: false
  },
  {
    id: "r2",
    examType: "TCF",
    skill: "reading",
    title: "Compréhension : L'Écotourisme Local",
    difficulty: "C1 (Advanced)",
    durationMinutes: 15,
    prompt: "Analysez la nuance d'expression dans cet extrait de presse environnementale.",
    passage: `Face au flux de touristes saturant les capitales européennes, de nouveaux forfaits écotouristiques ruraux ont fleuri. Les administrations régionales misent sur cette manne financière inespérée pour revitaliser des hameaux menacés d'abandon. Toutefois, l'arrivée désordonnée d'activités sportives motorisées suscite le scepticisme des résidents historiques, inquiets face aux atteintes portées à la tranquillité de la faune endémique. L'équilibre s'annonce précaire.`,
    questionType: "multiple-choice",
    choices: [
      "A) Les villageois accueillent à bras ouverts toutes les nouvelles attractions motorisées.",
      "B) L'expansion écotouristique rurale ne suscite que des réactions unanimes et positives.",
      "C) Il existe des frictions notables entre les projets de revitalisation économique et la stabilité écologique locale.",
      "D) Les capitales ont encouragé l'achat de camping-cars motorisés."
    ],
    correctChoiceIndex: 2,
    explanation: "Le texte souligne que l'expansion rurale apporte une 'manne inespérée' mais suscite en même temps un 'scepticisme... inquiet' des habitants quant aux nuisances écologiques, illustrant de façon parfaite un conflit entre la croissance économique et la protection locale.",
    isPremium: true
  },

  // LISTENING
  {
    id: "l1",
    examType: "TEF",
    skill: "listening",
    title: "Message de Messagerie : Enquête de Climatisation",
    difficulty: "A2/B1 (Low Intermediate)",
    durationMinutes: 5,
    prompt: "Écoutez la simulation d'annonce vocale ci-dessus (lisez le script ci-dessous si désiré) et indiquez pourquoi l'appelant laisse ce message.",
    transcript: "Bonjour, c'est Alain de la réception technique. Je vous contacte au sujet du dysfonctionnement du système de climatisation centrale signalé ce matin au troisième étage. L'ingénieur passera entre 14h et 16h; merci de veiller à ce que l'accès au compteur principal soit dégagé.",
    questionType: "multiple-choice",
    choices: [
      "A) Pour annuler un rendez-vous avec le concierge.",
      "B) Pour demander à dégager l'accès au compteur avant le passage du technicien.",
      "C) Pour signaler que la climatisation a déjà été entièrement réparée.",
      "D) Pour se plaindre de la canicule ambiante dans les escaliers."
    ],
    correctChoiceIndex: 1,
    explanation: "Alain précise : 'merci de veiller à ce que l'accès au compteur principal soit dégagé' pour l'ingénieur qui interviendra à 14h.",
    isPremium: false
  },
  {
    id: "l2",
    examType: "TCF",
    skill: "listening",
    title: "Chronique Radiophonique : Révolution Alimentaire",
    difficulty: "C2 (Expert)",
    durationMinutes: 8,
    prompt: "Suivez le débat sur l'intégration des insectes dans les menus scolaires généraux.",
    transcript: "Chers auditeurs, bonjour. Faut-il voir dans l'insecte l'avenir de nos apports protéiques ? L'Union Européenne a certes validé de nouvelles farines, mais le chemin s'annonce semé d'embûches dans les assiettes de l'Hexagone. Entre dégoût atavique et réticence de la filière porcine locale, l'acceptabilité sociale peine à décoller, en dépit du bilan carbone spectaculairement sobre de cette alternative écoresponsable.",
    questionType: "multiple-choice",
    choices: [
      "A) Les français ont massivement adopté la farine d'insectes.",
      "B) L'acceptation de cette protéine est entravée par des barrières culturelles et syndicales de l'élevage traditionnel.",
      "C) L'Union Européenne a strictement banni l'importation de grillons.",
      "D) La filière porcine a financé la création de pâtisseries à base de grillons."
    ],
    correctChoiceIndex: 1,
    explanation: "Le chroniqueur cite le 'dégoût atavique' (barrière culturelle) et les 'réticences de la filière porcine' (freins professionnels d'élevage) pour expliquer la lente acceptation.",
    isPremium: true,
    isMax: true
  },

  // WRITING
  {
    id: "w1",
    examType: "TEF",
    skill: "writing",
    title: "Lettre Argumentative : Pistes Cyclables Exclusives (Section B)",
    difficulty: "B2 (Intermediate)",
    durationMinutes: 40,
    prompt: "Le maire de votre municipalité prévoit de bannir totalement les voitures du centre-ville au profit exclusif de pistes cyclables. Rédigez une lettre argumentative au courrier des lecteurs du journal local pour défendre votre point de vue mitigé sur ce projet en proposant des nuances. (200 mots requis)",
    questionType: "essay",
    isPremium: true
  },
  {
    id: "w2",
    examType: "TCF",
    skill: "writing",
    title: "Tâche 2 : Analyse Comparative de Modes de Transports",
    difficulty: "C1 (Advanced)",
    durationMinutes: 60,
    prompt: "Comparez l'utilisation de la voiture électrique par rapport aux transports ferroviaires collectifs dans le combat contre le changement climatique. Rédigez un court essai structuré argumenté. (250 mots requis)",
    questionType: "essay",
    isPremium: true,
    isMax: true
  },

  // SPEAKING
  {
    id: "s1",
    examType: "TEF",
    skill: "speaking",
    title: "TEF Section A : S'informer sur un Cours de Poterie (Achat)",
    difficulty: "A2/B1",
    durationMinutes: 5,
    prompt: "Vous lisez une petite annonce pour des cours de sculpture et poterie en soirée. Appelez l'organisateur (votre examinateur ou le robot AI) pour obtenir un minimum de 8 informations clés : tarifs, matériel fourni, expérience nécessaire, horaires, etc. Adoptez un ton poli et informel.",
    questionType: "oral-response",
    isPremium: false
  },
  {
    id: "s2",
    examType: "TEF",
    skill: "speaking",
    title: "TEF Section B : Convaincre un Ami Récalcitrant",
    difficulty: "B2/C1",
    durationMinutes: 10,
    prompt: "Votre ami refuse catégoriquement d'utiliser le prêt de livres partagé dans le quartier, jugeant l'initiative insalubre et dérisoire. Racontez-lui les joies de la lecture circulaire et essayez de le convaincre d'y déposer 3 livres d'ici la fin du mois. Préparez vos arguments.",
    questionType: "oral-response",
    isPremium: true,
    isMax: true
  }
];

// Full-length practice exam definitions
export const MOCK_EXAMS_DB = [
  {
    id: "exam-tef-1",
    examType: "TEF" as const,
    name: "Frensify Official-Format TEF Simulation",
    description:
      "Full TEF: 40 reading MCQs (60 min), 40 listening MCQs (40 min), written expression A+B (60 min), oral expression A+B (15 min). Scored /699 (reading & listening) and /450 (writing & oral) → CLB/NCLC.",
    estimatedDurationMin: 175,
    readingsCount: 40,
    listeningsCount: 40,
    writingCount: 2,
    speakingCount: 2,
    premiumOnly: true
  },
  {
    id: "exam-tcf-1",
    examType: "TCF" as const,
    name: "Frensify Official-Format TCF Simulation",
    description:
      "Full TCF: 39 listening MCQs (35 min), 39 reading MCQs (60 min), 3 written expression tasks (60 min), 3 oral expression tasks (12 min). Scores on 0–699 scale mapped to CEFR levels.",
    estimatedDurationMin: 167,
    readingsCount: 39,
    listeningsCount: 39,
    writingCount: 3,
    speakingCount: 3,
    premiumOnly: true
  }
];
