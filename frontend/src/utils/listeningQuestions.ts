import type { McqItem } from "../types";

export const LISTENING_IMAGE_FRONT_COUNT = 3;

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

/** Place image-based questions in slots Q1–Q3, then fill the rest. */
export function orderListeningExamQuestions(
  questions: McqItem[],
  targetCount: number
): McqItem[] {
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
