import type { McqItem } from "../types";

export const LISTENING_IMAGE_FRONT_COUNT = 3;

/** Official TCF compréhension orale CEFR ramp (39 items, 1-based indices). */
export const TCF_LISTENING_DIFFICULTY_BANDS: { difficulty: string; count: number }[] = [
  { difficulty: "A1", count: 4 }, // Q1–4
  { difficulty: "A2", count: 6 }, // Q5–10
  { difficulty: "B1", count: 9 }, // Q11–19
  { difficulty: "B2", count: 10 }, // Q20–29
  { difficulty: "C1", count: 6 }, // Q30–35
  { difficulty: "C2", count: 4 }, // Q36–39
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function hasImage(question: McqItem): boolean {
  return Boolean(question.imageUrl?.trim());
}

function takeRandom<T>(pool: T[], take: number): T[] {
  if (take <= 0 || pool.length === 0) return [];
  return shuffle(pool).slice(0, Math.min(take, pool.length));
}

/**
 * TCF listening exam order: image-based items in Q1–Q3, then CEFR bands
 * A1→C2 matching the official 39-question ramp.
 */
export function orderTcfListeningExamQuestions(
  questions: McqItem[],
  targetCount: number
): McqItem[] {
  const byDifficulty = new Map<string, McqItem[]>();
  for (const question of questions) {
    const difficulty = question.difficulty?.trim();
    if (!difficulty) continue;
    const bucket = byDifficulty.get(difficulty) ?? [];
    bucket.push(question);
    byDifficulty.set(difficulty, bucket);
  }

  const result: McqItem[] = [];
  const usedIds = new Set<string>();

  TCF_LISTENING_DIFFICULTY_BANDS.forEach((band, bandIndex) => {
    if (result.length >= targetCount) return;
    const take = Math.min(band.count, targetCount - result.length);
    const pool = (byDifficulty.get(band.difficulty) ?? []).filter(
      (q) => !usedIds.has(q.id)
    );
    if (pool.length === 0) return;

    let picked: McqItem[];
    if (bandIndex === 0) {
      const imagePool = pool.filter(hasImage);
      const otherPool = pool.filter((q) => !hasImage(q));
      const imageTake = Math.min(LISTENING_IMAGE_FRONT_COUNT, take, imagePool.length);
      picked = takeRandom(imagePool, imageTake);
      picked = [
        ...picked,
        ...takeRandom(
          otherPool.filter((q) => !picked.includes(q)),
          take - picked.length
        ),
      ];
      if (picked.length < take) {
        const leftover = imagePool.filter((q) => !picked.includes(q));
        picked = [...picked, ...takeRandom(leftover, take - picked.length)];
      }
    } else {
      picked = takeRandom(pool, take);
    }

    for (const question of picked) {
      result.push(question);
      usedIds.add(question.id);
    }
  });

  if (result.length < targetCount) {
    const filler = takeRandom(
      questions.filter((q) => !usedIds.has(q.id)),
      targetCount - result.length
    );
    result.push(...filler);
  }

  return result.slice(0, targetCount);
}

/** Place image-based questions in front slots, then fill the rest (TEF / fallback). */
export function orderListeningExamQuestions(
  questions: McqItem[],
  targetCount: number,
  options?: { examType?: "TCF" | "TEF" }
): McqItem[] {
  if (options?.examType === "TCF") {
    return orderTcfListeningExamQuestions(questions, targetCount);
  }

  const imageQuestions = questions.filter(hasImage);
  const otherQuestions = questions.filter((q) => !hasImage(q));

  const frontSlots = Math.min(
    LISTENING_IMAGE_FRONT_COUNT,
    imageQuestions.length,
    targetCount
  );
  const front = shuffle(imageQuestions).slice(0, frontSlots);
  const remaining = targetCount - front.length;
  const rest = shuffle(otherQuestions).slice(
    0,
    Math.min(remaining, otherQuestions.length)
  );

  let combined = [...front, ...rest];
  if (combined.length < targetCount) {
    const usedIds = new Set(combined.map((q) => q.id));
    const filler = shuffle(questions).filter((q) => !usedIds.has(q.id));
    combined = [
      ...combined,
      ...filler.slice(0, targetCount - combined.length),
    ];
  }

  return combined.slice(0, targetCount);
}
