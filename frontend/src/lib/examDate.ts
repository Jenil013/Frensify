/** Calendar days from today until examDate (YYYY-MM-DD). Negative if past. */
export function daysUntilExamDate(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(`${examDate}T00:00:00`);
  exam.setHours(0, 0, 0, 0);
  const diffMs = exam.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatExamCountdown(examDate: string | null | undefined): string | null {
  if (!examDate) return null;
  const days = daysUntilExamDate(examDate);
  if (days > 1) return `${days} days`;
  if (days === 1) return "1 day";
  if (days === 0) return "today";
  const ago = Math.abs(days);
  return ago === 1 ? "1 day ago" : `${ago} days ago`;
}

export function formatStreakLabel(days: number): string {
  if (days === 1) return "1 Day";
  return `${days} Days`;
}

export function examCountdownPhrase(
  examType: string,
  examDate: string | null | undefined
): { prefix: string; highlight: string | null; suffix: string } {
  const countdown = formatExamCountdown(examDate);
  if (!countdown) {
    return {
      prefix: `Your official ${examType} pathway examination —`,
      highlight: null,
      suffix: "add your exam date in Candidate Settings",
    };
  }
  if (countdown === "today") {
    return {
      prefix: `Your official ${examType} pathway examination is`,
      highlight: "today",
      suffix: "",
    };
  }
  if (countdown.endsWith(" ago")) {
    return {
      prefix: `Your official ${examType} pathway examination was`,
      highlight: countdown,
      suffix: "",
    };
  }
  return {
    prefix: `Your official ${examType} pathway examination is in`,
    highlight: countdown,
    suffix: "",
  };
}
