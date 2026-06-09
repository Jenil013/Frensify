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
 * Supabase table mapping (when you connect your question bank):
 *
 * - reading_questions: id, prompt, passage, choices (jsonb), correct_index, explanation, sort_order
 * - listening_questions: id, prompt, audio_url, transcript, choices (jsonb), correct_index, explanation, sort_order
 * - exercise_items (writing): module_id, combination_index, tasks jsonb (3 tâches per row)
 * - oral_prompts: module_section ('A'|'B'), prompt, stimulus
 */

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.length > 0 && key.length > 0);
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
  examMode = true
): Promise<TcfModuleDefinition> {
  switch (moduleId) {
    case "comprehension-orale": {
      if (isSupabaseConfigured()) {
        try {
          const questions = await fetchQuestions("TCF", moduleId, {
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
          const questions = await fetchQuestions("TCF", moduleId, {
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
  examMode = true
): Promise<TefModuleDefinition> {
  switch (moduleId) {
    case "comprehension-ecrite": {
      if (isSupabaseConfigured()) {
        try {
          const questions = await fetchQuestions("TEF", moduleId, {
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
          const questions = await fetchQuestions("TEF", moduleId, {
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
