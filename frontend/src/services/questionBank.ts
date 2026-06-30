import { McqItem, TcfModuleDefinition, TcfModuleId, TefModuleDefinition, TefModuleId } from "../types";
import {
  PLACEHOLDER_LISTENING_QUESTIONS,
  PLACEHOLDER_READING_QUESTIONS,
  TCF_MODULE_REGISTRY,
} from "../tcfConstants";
import {
  TEF_MODULE_REGISTRY,
  TEF_PLACEHOLDER_LISTENING_QUESTIONS,
  TEF_PLACEHOLDER_READING_QUESTIONS,
} from "../tefConstants";
import {
  fetchQuestions,
  fetchOralCombination,
  fetchWritingCombination,
} from "../lib/apiClient";
import { buildRandomTcfTask1Section } from "../utils/tcfOralTask1";
import { orderListeningExamQuestions } from "../utils/listeningQuestions";

const TEF_READING_QUESTION_TARGET = 40;
const TCF_READING_QUESTION_TARGET = 39;
const TCF_LISTENING_QUESTION_TARGET = 39;
const TEF_LISTENING_QUESTION_TARGET = 40;

const PLACEHOLDER_LISTENING_IMAGE = "/fevicon_Logo.svg";

/**
 * MCQ content is loaded via FastAPI `/api/v1/questions` (not direct Supabase reads).
 *
 * - reading_questions: exam_type, module_id, prompt, passage, choices, correct_index, …
 * - listening_questions: exam_type, module_id, prompt, audio_path, image_path, choices, …
 * - exercise_items (writing): module_id, combination_index, tasks jsonb
 *   (TCF: 3 tâches per row; TEF: Section A + B per row)
 */

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.length > 0 && key.length > 0);
}

async function tryFetchMcqQuestions(
  examType: "TCF" | "TEF",
  moduleId: string,
  limit: number
): Promise<McqItem[] | null> {
  try {
    const questions = await fetchQuestions(examType, moduleId, { limit });
    return questions.length > 0 ? questions : null;
  } catch (err) {
    console.warn(
      `[questionBank] Backend load failed for ${examType} ${moduleId}, using placeholders.`,
      err
    );
    return null;
  }
}

function attachMcqQuestions(
  moduleId: TcfModuleId,
  questions: McqItem[]
): TcfModuleDefinition {
  const base = TCF_MODULE_REGISTRY[moduleId];
  return { ...base, questions };
}

function withPlaceholderListeningImages(questions: McqItem[]): McqItem[] {
  return questions.map((q, index) =>
    index < 3 ? { ...q, imageUrl: PLACEHOLDER_LISTENING_IMAGE } : q
  );
}

function placeholderListeningQuestions(): McqItem[] {
  return orderListeningExamQuestions(
    withPlaceholderListeningImages(PLACEHOLDER_LISTENING_QUESTIONS),
    TCF_LISTENING_QUESTION_TARGET
  );
}

function placeholderTefListeningQuestions(): McqItem[] {
  return orderListeningExamQuestions(
    withPlaceholderListeningImages(TEF_PLACEHOLDER_LISTENING_QUESTIONS),
    TEF_LISTENING_QUESTION_TARGET
  );
}

export async function loadTcfModule(
  moduleId: TcfModuleId,
  examMode = true,
  freeSet?: 1 | 2
): Promise<TcfModuleDefinition> {
  switch (moduleId) {
    case "comprehension-orale": {
      if (isSupabaseConfigured()) {
        try {
          const questions = freeSet
            ? await fetchQuestions("TCF", moduleId, { set: freeSet })
            : await fetchQuestions("TCF", moduleId, {
                limit: TCF_LISTENING_QUESTION_TARGET,
              });
          if (questions.length > 0) {
            return attachMcqQuestions(moduleId, questions);
          }
        } catch (err) {
          console.warn(
            `[questionBank] Backend load failed for TCF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return attachMcqQuestions(moduleId, placeholderListeningQuestions());
    }
    case "comprehension-ecrite": {
      if (isSupabaseConfigured()) {
        try {
          const questions = freeSet
            ? await fetchQuestions("TCF", moduleId, { set: freeSet })
            : await fetchQuestions("TCF", moduleId, {
                limit: TCF_READING_QUESTION_TARGET,
              });
          if (questions.length > 0) {
            return attachMcqQuestions(moduleId, questions);
          }
        } catch (err) {
          console.warn(
            `[questionBank] Backend load failed for TCF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return attachMcqQuestions(moduleId, PLACEHOLDER_READING_QUESTIONS);
    }
    case "expression-ecrite": {
      const base = TCF_MODULE_REGISTRY[moduleId];
      if (isSupabaseConfigured()) {
        try {
          const combo = await fetchWritingCombination("TCF", moduleId);
          return {
            ...base,
            sections: combo.sections,
          };
        } catch (err) {
          console.warn(
            `[questionBank] Writing combination load failed for TCF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return { ...base };
    }
    case "expression-orale": {
      const base = TCF_MODULE_REGISTRY[moduleId];
      if (isSupabaseConfigured()) {
        try {
          const combo = await fetchOralCombination("TCF", moduleId);
          return {
            ...base,
            sections: combo.sections,
            combinationId: combo.id,
            combinationTitle: combo.title,
          };
        } catch (err) {
          console.warn(
            `[questionBank] Oral combination load failed for TCF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return {
        ...base,
        sections: {
          ...base.sections,
          "1": buildRandomTcfTask1Section(),
        },
      };
    }
    default: {
      const _exhaustive: never = moduleId;
      throw new Error(`Unknown TCF module: ${_exhaustive}`);
    }
  }
}

export function mergeModuleQuestions(
  module: TcfModuleDefinition,
  questions: McqItem[]
): TcfModuleDefinition {
  return { ...module, questions };
}

function attachTefMcqQuestions(
  moduleId: TefModuleId,
  questions: McqItem[]
): TefModuleDefinition {
  const base = TEF_MODULE_REGISTRY[moduleId];
  return { ...base, questions };
}

export async function loadTefModule(
  moduleId: TefModuleId,
  examMode = true,
  freeSet?: 1 | 2
): Promise<TefModuleDefinition> {
  switch (moduleId) {
    case "comprehension-ecrite": {
      if (isSupabaseConfigured()) {
        try {
          const questions = freeSet
            ? await fetchQuestions("TEF", moduleId, { set: freeSet })
            : await fetchQuestions("TEF", moduleId, {
                limit: TEF_READING_QUESTION_TARGET,
              });
          if (questions.length > 0) {
            return attachTefMcqQuestions(moduleId, questions);
          }
        } catch (err) {
          console.warn(
            `[questionBank] Backend load failed for TEF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return attachTefMcqQuestions(moduleId, TEF_PLACEHOLDER_READING_QUESTIONS);
    }
    case "comprehension-orale": {
      if (isSupabaseConfigured()) {
        try {
          const questions = freeSet
            ? await fetchQuestions("TEF", moduleId, { set: freeSet })
            : await fetchQuestions("TEF", moduleId, {
                limit: TEF_LISTENING_QUESTION_TARGET,
              });
          if (questions.length > 0) {
            return attachTefMcqQuestions(moduleId, questions);
          }
        } catch (err) {
          console.warn(
            `[questionBank] Backend load failed for TEF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return attachTefMcqQuestions(moduleId, placeholderTefListeningQuestions());
    }
    case "expression-ecrite": {
      const base = TEF_MODULE_REGISTRY[moduleId];
      if (isSupabaseConfigured()) {
        try {
          const combo = await fetchWritingCombination("TEF", moduleId);
          return {
            ...base,
            sections: combo.sections,
            combinationId: combo.id,
            combinationTitle: combo.title,
          };
        } catch (err) {
          console.warn(
            `[questionBank] Writing combination load failed for TEF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return { ...base };
    }
    case "expression-orale": {
      const base = TEF_MODULE_REGISTRY[moduleId];
      if (isSupabaseConfigured()) {
        try {
          const combo = await fetchOralCombination("TEF", moduleId);
          return {
            ...base,
            sections: combo.sections,
            combinationId: combo.id,
            combinationTitle: combo.title,
          };
        } catch (err) {
          console.warn(
            `[questionBank] Oral combination load failed for TEF ${moduleId}, using placeholders.`,
            err
          );
        }
      }
      return { ...base };
    }
    default:
      return { ...TEF_MODULE_REGISTRY[moduleId] };
  }
}
