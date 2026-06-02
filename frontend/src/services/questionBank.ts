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
import { fetchQuestions } from "../lib/apiClient";

const TEF_READING_QUESTION_TARGET = 40;

/**
 * Supabase table mapping (when you connect your question bank):
 *
 * - reading_questions: id, prompt, passage, choices (jsonb), correct_index, explanation, sort_order
 * - listening_questions: id, prompt, audio_url, transcript, choices (jsonb), correct_index, explanation, sort_order
 * - writing_prompts: module_section ('A'|'B'), prompt, stimulus
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

export async function loadTcfModule(
  moduleId: TcfModuleId
): Promise<TcfModuleDefinition> {
  if (isSupabaseConfigured()) {
    try {
      const fromDb = await fetchModuleFromSupabase(moduleId);
      if (fromDb) return fromDb;
    } catch (err) {
      console.warn(
        `[questionBank] Supabase load failed for ${moduleId}, using placeholders.`,
        err
      );
    }
  }

  switch (moduleId) {
    case "comprehension-ecrite":
      return attachMcqQuestions(moduleId, PLACEHOLDER_READING_QUESTIONS);
    case "comprehension-orale":
      return attachMcqQuestions(moduleId, PLACEHOLDER_LISTENING_QUESTIONS);
    default:
      return { ...TCF_MODULE_REGISTRY[moduleId] };
  }
}

async function fetchModuleFromSupabase(
  _moduleId: TcfModuleId
): Promise<TcfModuleDefinition | null> {
  return null;
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
  moduleId: TefModuleId
): Promise<TefModuleDefinition> {
  switch (moduleId) {
    case "comprehension-ecrite": {
      if (isSupabaseConfigured()) {
        try {
          const questions = await fetchQuestions(
            "TEF",
            moduleId,
            TEF_READING_QUESTION_TARGET
          );
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
    case "comprehension-orale":
      return attachTefMcqQuestions(moduleId, TEF_PLACEHOLDER_LISTENING_QUESTIONS);
    default:
      return { ...TEF_MODULE_REGISTRY[moduleId] };
  }
}
