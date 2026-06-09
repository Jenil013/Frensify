import type {
  OralModuleResult,
  TcfModuleCompletionResult,
  TcfModuleId,
  TefModuleCompletionResult,
  TefModuleId,
  WritingModuleResult,
} from "../types";

type TcfResultsMap = Partial<Record<TcfModuleId, TcfModuleCompletionResult>>;
type TefResultsMap = Partial<Record<TefModuleId, TefModuleCompletionResult>>;

function hasPendingEval(
  entry: TcfModuleCompletionResult | TefModuleCompletionResult
): entry is TcfModuleCompletionResult & {
  pendingEval: Promise<WritingModuleResult | OralModuleResult>;
} {
  return (
    (entry.type === "writing" || entry.type === "oral") &&
    entry.pendingEval != null
  );
}

export function anyPendingEvals(
  results: TcfResultsMap | TefResultsMap
): boolean {
  return Object.values(results).some(
    (entry) => entry != null && hasPendingEval(entry)
  );
}

export async function resolveTcfPendingEvals(
  results: TcfResultsMap
): Promise<TcfResultsMap> {
  const merged: TcfResultsMap = { ...results };
  await Promise.all(
    Object.entries(merged).map(async ([moduleId, entry]) => {
      if (!entry || !hasPendingEval(entry)) return;
      const evaluated = await entry.pendingEval;
      merged[moduleId as TcfModuleId] = {
        type: entry.type,
        result: evaluated,
      } as TcfModuleCompletionResult;
    })
  );
  return merged;
}

export async function resolveTefPendingEvals(
  results: TefResultsMap
): Promise<TefResultsMap> {
  const merged: TefResultsMap = { ...results };
  await Promise.all(
    Object.entries(merged).map(async ([moduleId, entry]) => {
      if (!entry || !hasPendingEval(entry)) return;
      const evaluated = await entry.pendingEval;
      merged[moduleId as TefModuleId] = {
        type: entry.type,
        moduleId: entry.moduleId,
        result: evaluated,
      };
    })
  );
  return merged;
}
