export function formatTakenDate(takenAt: string): string {
  const normalized = takenAt.includes("T") ? takenAt : `${takenAt}T12:00:00`;
  const ts = Date.parse(normalized);
  if (Number.isNaN(ts)) return takenAt;
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function scorePillClass(scorePct: number | null): string {
  if (scorePct == null) return "bg-[#F1F1EF] text-[#5F5E5B] border-[#E9E9E7]";
  if (scorePct >= 80) return "bg-[#EAF5F1] text-[#2D6A53] border-[#D1EBE1]";
  if (scorePct >= 70) return "bg-[#FDF3E7] text-[#9A5013] border-[#FCE1CA]";
  return "bg-[#FCECF0] text-[#B83E5C] border-[#F8D4DE]";
}
