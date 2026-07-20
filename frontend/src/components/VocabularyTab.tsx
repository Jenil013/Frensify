import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  BookOpen,
  RotateCcw,
  ChevronRight,
  Trophy,
  ArrowDown,
} from "lucide-react";
import { UserProfile, VocabExplanation, VocabularyCard, VocabularySuggestion, VocabularyStats } from "../types";
import {
  addVocabularyCard,
  explainVocabulary,
  fetchUsageLimits,
  fetchVocabularyCards,
  fetchVocabularyReview,
  fetchVocabularyStats,
  fetchVocabularySuggestions,
  updateVocabularyCard,
} from "../lib/apiClient";
import UsageLimitModal from "./UsageLimitModal";

type VocabMode = "review" | "browse";

interface VocabularyTabProps {
  profile: UserProfile;
  initialMode?: VocabMode;
  initialCategory?: string;
  initialCategories?: string[];
  onNavigateToPricing?: () => void;
  onStatsUpdated?: (stats: VocabularyStats) => void;
}

const CEFR_LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function defaultDifficultyFilter(target: string): string {
  const idx = CEFR_LEVELS.indexOf(target as (typeof CEFR_LEVELS)[number]);
  if (idx <= 0) return "All";
  return target;
}

type DailyReviewCompleteProps = {
  cardsReviewed: number;
  gotIt: number;
  again: number;
  stats: VocabularyStats | null;
  examLabel: string;
  targetScore: string;
  onBrowseDecks: () => void;
  onPracticeMore: () => void;
  onScrollToLookup: () => void;
};

function DailyReviewComplete({
  cardsReviewed,
  gotIt,
  again,
  stats,
  examLabel,
  targetScore,
  onBrowseDecks,
  onPracticeMore,
  onScrollToLookup,
}: DailyReviewCompleteProps) {
  const masteryPct =
    cardsReviewed > 0 ? Math.round((gotIt / cardsReviewed) * 100) : 0;

  return (
    <div
      id="daily-review-complete"
      className="max-w-md mx-auto text-center space-y-6 py-4 animate-celebrate"
    >
      <div className="relative w-20 h-20 mx-auto">
        <span
          className="absolute inset-0 rounded-full bg-[#2D6A53]/15 animate-celebrate-ring"
          aria-hidden
        />
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#EAF5F1] to-[#D1EBE1] border border-[#CDDFD9] flex items-center justify-center shadow-premium">
          <Trophy className="w-9 h-9 text-[#2D6A53]" strokeWidth={1.75} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D6A53]">
          Daily target reached
        </p>
        <h4 className="text-xl font-bold text-[#37352F] tracking-tight">
          Well done - you&apos;re done for today
        </h4>
        <p className="text-xs text-[#7A7A78] leading-relaxed max-w-sm mx-auto">
          You reviewed <strong className="text-[#37352F]">{cardsReviewed} cards</strong>.
          Steady recall practice builds the connectors and collocations you need on{" "}
          {examLabel} exam day.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-left">
        <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-3">
          <p className="text-[9px] font-bold uppercase text-[#7A7A78] mb-1">Got it</p>
          <p className="text-lg font-bold text-[#2D6A53]">{gotIt}</p>
        </div>
        <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-3">
          <p className="text-[9px] font-bold uppercase text-[#7A7A78] mb-1">Again</p>
          <p className="text-lg font-bold text-[#B83E5C]">{again}</p>
        </div>
        <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-3">
          <p className="text-[9px] font-bold uppercase text-[#7A7A78] mb-1">Recall</p>
          <p className="text-lg font-bold text-[#37352F]">{masteryPct}%</p>
        </div>
      </div>

      {stats && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#5F5E5B]">
          <span className="inline-flex items-center gap-1.5 bg-[#EAF5F1] border border-[#D1EBE1] px-2.5 py-1 rounded-full font-medium text-[#2D6A53]">
            <Check className="w-3 h-3" />
            {stats.reviewedToday}/{stats.dailyGoal} today
          </span>
          {stats.reviewedThisWeek > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-[#F1F1EF] border border-[#E9E9E7] px-2.5 py-1 rounded-full">
              {stats.reviewedThisWeek} this week
            </span>
          )}
        </div>
      )}

      <div className="bg-[#FDF8EE] border border-[#F5E6C8] rounded-xl p-4 text-left space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A5013]">
          Next best step
        </p>
        <p className="text-xs text-[#5F5E5B] leading-relaxed">
          Keep this tab open - look up one connector you hesitated on, or browse a deck
          at <strong className="text-[#37352F]">{targetScore}</strong> level. Tomorrow&apos;s
          5-card round will surface words that need more recall.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          type="button"
          onClick={onScrollToLookup}
          className="px-4 py-2.5 text-xs font-bold bg-[#37352F] text-white rounded-xl cursor-pointer hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Look up a word
        </button>
        <button
          type="button"
          onClick={onBrowseDecks}
          className="px-4 py-2.5 text-xs font-bold bg-white border border-[#E9E9E7] text-[#37352F] rounded-xl cursor-pointer hover:bg-[#FAFAF9] transition-colors"
        >
          Browse decks
        </button>
        <button
          type="button"
          onClick={onPracticeMore}
          className="px-4 py-2.5 text-xs font-bold text-[#2D6A53] hover:underline cursor-pointer"
        >
          Practice 5 more
        </button>
      </div>

      <button
        type="button"
        onClick={onScrollToLookup}
        className="inline-flex items-center gap-1 text-[10px] text-[#7A7A78] hover:text-[#37352F] transition-colors cursor-pointer mx-auto"
      >
        <ArrowDown className="w-3 h-3 animate-bounce" />
        AI lookup is just below
      </button>
    </div>
  );
}

export default function VocabularyTab({
  profile,
  initialMode = "review",
  initialCategory,
  initialCategories,
  onNavigateToPricing,
  onStatsUpdated,
}: VocabularyTabProps) {
  const [mode, setMode] = useState<VocabMode>(initialMode);
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [reviewQueue, setReviewQueue] = useState<VocabularyCard[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [suggestion, setSuggestion] = useState<VocabularySuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    defaultDifficultyFilter(profile.targetScore)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory ?? "All"
  );
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const [searchWord, setSearchWord] = useState("");
  const [searchTranslation, setSearchTranslation] = useState("");
  const [loadingAIExplain, setLoadingAIExplain] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<VocabExplanation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usageLimitBlock, setUsageLimitBlock] = useState<string | null>(null);
  const [vocabUsage, setVocabUsage] = useState<{ used: number; cap: number } | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionGotIt, setSessionGotIt] = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);

  const onStatsUpdatedRef = useRef(onStatsUpdated);
  const lookupSectionRef = useRef<HTMLDivElement>(null);
  onStatsUpdatedRef.current = onStatsUpdated;

  const reviewCategoriesKey = useMemo(
    () => (initialCategories ?? []).join("\0"),
    [initialCategories]
  );

  const refreshStats = useCallback(async () => {
    try {
      const s = await fetchVocabularyStats();
      setStats(s);
      onStatsUpdatedRef.current?.(s);
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadReviewQueue = useCallback(
    async (categories?: string[]) => {
      setReviewLoading(true);
      try {
        const queue = await fetchVocabularyReview({
          limit: 5,
          examType: profile.targetExam,
          categories,
        });
        setReviewQueue(queue);
        setReviewIndex(0);
        setRevealed(false);
        setSessionComplete(false);
        setSessionGotIt(0);
        setSessionAgain(0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not load review queue.");
      } finally {
        setReviewLoading(false);
      }
    },
    [profile.targetExam]
  );

  const scrollToLookup = useCallback(() => {
    lookupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const input = document.getElementById("input-ai-vocab") as HTMLInputElement | null;
    window.setTimeout(() => input?.focus(), 400);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVocabulary() {
      setLoading(true);
      setError(null);
      try {
        const [cardData, statsData, suggestionData, limits] = await Promise.all([
          fetchVocabularyCards(),
          fetchVocabularyStats(),
          fetchVocabularySuggestions(),
          fetchUsageLimits().catch(() => null),
        ]);
        if (cancelled) return;

        setCards(cardData);
        setStats(statsData);
        setSuggestion(suggestionData);
        onStatsUpdatedRef.current?.(statsData);

        if (limits) {
          setVocabUsage({
            used: limits.weeklyUsage.vocabExplain,
            cap: limits.weeklyCaps.vocabExplain,
          });
        }

        const categories =
          initialCategories ?? suggestionData.suggestedCategories;
        setReviewLoading(true);
        const queue = await fetchVocabularyReview({
          limit: 5,
          examType: profile.targetExam,
          categories,
        });
        if (cancelled) return;

        setReviewQueue(queue);
        setReviewIndex(0);
        setRevealed(false);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load vocabulary."
          );
        }
      } finally {
        if (!cancelled) {
          setReviewLoading(false);
          setLoading(false);
        }
      }
    }

    void loadVocabulary();
    return () => {
      cancelled = true;
    };
  }, [profile.targetExam, reviewCategoriesKey]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(cards.map((v) => v.category)))],
    [cards]
  );

  const filteredVocab = useMemo(() => {
    return cards.filter((v) => {
      const examOk =
        v.examType === "both" || v.examType === profile.targetExam;
      const diffMatch =
        selectedDifficulty === "All" || v.difficulty === selectedDifficulty;
      const catMatch =
        selectedCategory === "All" || v.category === selectedCategory;
      return examOk && diffMatch && catMatch;
    });
  }, [cards, profile.targetExam, selectedCategory, selectedDifficulty]);

  const currentReviewCard = reviewQueue[reviewIndex];

  const handleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleMastery = async (id: string, mastered: boolean) => {
    try {
      const updated = await updateVocabularyCard(id, { mastered: !mastered });
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Could not update card.");
    }
  };

  const handleReviewRate = async (result: "again" | "got_it") => {
    if (!currentReviewCard) return;
    const isLastCard = reviewIndex + 1 >= reviewQueue.length;
    try {
      const updated = await updateVocabularyCard(currentReviewCard.id, {
        reviewResult: result,
      });
      setCards((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      if (result === "got_it") {
        setSessionGotIt((n) => n + 1);
      } else {
        setSessionAgain((n) => n + 1);
      }
      await refreshStats();
      if (isLastCard) {
        setSessionComplete(true);
      } else {
        setReviewIndex((i) => i + 1);
        setRevealed(false);
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Could not save review.");
    }
  };

  const handleAskAIExplanation = async () => {
    if (!searchWord.trim()) return;
    setLoadingAIExplain(true);
    setApiError(null);
    setAiExplanation(null);
    try {
      const res = await explainVocabulary(searchWord.trim(), {
        translation: searchTranslation.trim() || undefined,
        examType: profile.targetExam,
      });
      setAiExplanation(res);

      const exists = cards.some(
        (v) => v.word.toLowerCase() === res.word.toLowerCase()
      );
      if (!exists) {
        const created = await addVocabularyCard({
          word: res.word,
          translation: res.translation,
          difficulty: ((res.difficulty.match(/A1|A2|B1|B2|C1|C2/)?.[0] ??
            "B2") as VocabularyCard["difficulty"]),
          category: "AI Generated",
          exampleSentence: res.exampleSentence,
          examType: profile.targetExam,
        });
        setCards((prev) => [created, ...prev]);
      }

      const limits = await fetchUsageLimits();
      setVocabUsage({
        used: limits.weeklyUsage.vocabExplain,
        cap: limits.weeklyCaps.vocabExplain,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not fetch AI advice.";
      if (message.toLowerCase().includes("limit") || message.includes("429")) {
        setUsageLimitBlock(message);
      } else {
        setApiError(message);
      }
    } finally {
      setLoadingAIExplain(false);
    }
  };

  const examLabel = profile.targetExam === "TEF" ? "TEF Canada" : "TCF";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#7A7A78]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading vocabulary decks…</span>
      </div>
    );
  }

  return (
    <div id="vocabulary-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <UsageLimitModal
        open={usageLimitBlock != null}
        block={usageLimitBlock}
        onClose={() => setUsageLimitBlock(null)}
        onUpgrade={onNavigateToPricing ?? (() => {})}
      />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#37352F]">
            Vocabulary for {examLabel} · target {profile.targetScore}
          </h2>
          <p className="text-xs text-[#7A7A78]">
            Exam-oriented connectors, collocations, and oral phrases, with daily active recall.
          </p>
          {stats && (
            <p className="text-[11px] text-[#2D6A53] mt-1 font-mono">
              {stats.reviewedToday}/{stats.dailyGoal} reviewed today · {stats.reviewedThisWeek} this week
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("review")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              mode === "review"
                ? "bg-[#37352F] text-white border-[#37352F]"
                : "bg-white text-[#37352F] border-[#E9E9E7]"
            }`}
          >
            Daily Review
            {sessionComplete && (
              <span className="ml-1.5 inline-flex w-1.5 h-1.5 rounded-full bg-[#2D6A53] align-middle" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode("browse")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              mode === "browse"
                ? "bg-[#37352F] text-white border-[#37352F]"
                : "bg-white text-[#37352F] border-[#E9E9E7]"
            }`}
          >
            Browse Decks
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FCECF0] border border-[#F8D4DE] text-xs p-3 rounded-lg text-[#B83E5C] flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {suggestion?.hasSuggestion && suggestion.reason && (
        <div className="bg-[#EAF5F1] border border-[#D1EBE1] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A53] mb-1">
              Suggested for you
            </p>
            <p className="text-xs text-[#2D6A53] leading-relaxed">{suggestion.reason}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode("review");
              void loadReviewQueue(suggestion.suggestedCategories);
            }}
            className="text-xs font-bold px-3 py-2 bg-[#2D6A53] text-white rounded-lg shrink-0 cursor-pointer flex items-center gap-1"
          >
            Start Daily Review <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {mode === "review" && (
        <div
          className={`border rounded-2xl p-6 shadow-premium space-y-5 transition-colors ${
            sessionComplete
              ? "bg-gradient-to-b from-[#F4FAF7] to-white border-[#D1EBE1]"
              : "bg-white border-[#E9E9E7]"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#37352F]">
              {sessionComplete ? "Daily Review - complete" : "Daily Review - 5 cards"}
            </h3>
            <span className="text-[10px] font-mono text-[#7A7A78]">
              {sessionComplete
                ? `${reviewQueue.length} / ${reviewQueue.length}`
                : reviewQueue.length > 0
                  ? `${reviewIndex + 1} / ${reviewQueue.length}`
                  : "0 / 0"}
            </span>
          </div>

          {sessionComplete ? (
            <DailyReviewComplete
              cardsReviewed={reviewQueue.length}
              gotIt={sessionGotIt}
              again={sessionAgain}
              stats={stats}
              examLabel={examLabel}
              targetScore={profile.targetScore}
              onBrowseDecks={() => setMode("browse")}
              onPracticeMore={() =>
                void loadReviewQueue(
                  initialCategories ?? suggestion?.suggestedCategories
                )
              }
              onScrollToLookup={scrollToLookup}
            />
          ) : reviewLoading ? (
            <div className="flex justify-center py-12 text-[#7A7A78]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : !currentReviewCard ? (
            <div className="text-center py-10 space-y-3">
              <BookOpen className="w-8 h-8 text-[#7A7A78] mx-auto opacity-60" />
              <p className="text-sm text-[#37352F] font-medium">No cards due right now.</p>
              <p className="text-xs text-[#7A7A78]">
                Browse <strong>Argument connectors</strong> or add a word with AI lookup.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("Argument connectors");
                  setMode("browse");
                }}
                className="text-xs font-bold text-[#1A73E8] hover:underline cursor-pointer"
              >
                Browse Argument connectors
              </button>
            </div>
          ) : (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-center space-y-2 py-6">
                <span className="text-[9px] font-bold uppercase bg-[#F1F1EF] px-2 py-0.5 rounded text-[#5F5E5B]">
                  {currentReviewCard.difficulty} · {currentReviewCard.category}
                </span>
                <p className="text-2xl font-bold text-[#37352F]">{currentReviewCard.word}</p>
                {currentReviewCard.exampleSentence && revealed && (
                  <p className="text-xs text-[#5F5E5B] italic px-4">
                    {currentReviewCard.exampleSentence}
                  </p>
                )}
              </div>

              {!revealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="w-full py-3 bg-[#F1F1EF] hover:bg-[#E9E9E7] text-sm font-bold rounded-xl cursor-pointer transition-all"
                >
                  Reveal meaning
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-[#EBF3FC] border border-[#D2E7F6] rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-[#1E3A8A]">
                      {currentReviewCard.translation}
                    </p>
                    {currentReviewCard.exampleSentence && (
                      <p className="text-xs text-[#55698B] mt-2 italic">
                        {currentReviewCard.exampleSentence}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleReviewRate("again")}
                      className="py-2.5 text-xs font-bold border border-[#F8D4DE] bg-[#FCECF0] text-[#B83E5C] rounded-lg cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Again
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReviewRate("got_it")}
                      className="py-2.5 text-xs font-bold border border-[#D1EBE1] bg-[#EAF5F1] text-[#2D6A53] rounded-lg cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Got it
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div
        ref={lookupSectionRef}
        className="bg-[#EEEFFC] border border-[#DDE0FA] rounded-xl p-5 shadow-premium"
      >
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A55A2]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A55A2]">
                Look up a word
              </h3>
            </div>
            {vocabUsage && (
              <span className="text-[10px] font-mono text-[#5C649E]">
                {vocabUsage.used}/{vocabUsage.cap} AI lookups this week
              </span>
            )}
          </div>
          <p className="text-xs text-[#5C649E] leading-relaxed">
            Enter a French expression to see TEF/TCF usage, examples, and exam relevance.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              id="input-ai-vocab"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Ex: néanmoins, dorénavant…"
              className="flex-1 px-3 py-1.5 text-xs border border-[#DDE0FA] bg-white rounded-lg placeholder-[#4A55A2]/30 outline-none text-[#37352F] focus:border-[#4A55A2]"
              onKeyDown={(e) => e.key === "Enter" && void handleAskAIExplanation()}
            />
            <input
              type="text"
              value={searchTranslation}
              onChange={(e) => setSearchTranslation(e.target.value)}
              placeholder="English (optional)"
              className="sm:w-40 px-3 py-1.5 text-xs border border-[#DDE0FA] bg-white rounded-lg placeholder-[#4A55A2]/30 outline-none text-[#37352F] focus:border-[#4A55A2]"
            />
            <button
              id="btn-ai-explain-vocab"
              type="button"
              onClick={() => void handleAskAIExplanation()}
              disabled={loadingAIExplain || !searchWord.trim()}
              className="px-4 py-1.5 bg-[#4A55A2] hover:bg-[#343D84] disabled:bg-[#DDE0FA] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {loadingAIExplain ? (
                <>
                  <Loader2 className="w-3 animate-spin" /> Analyzing…
                </>
              ) : (
                "Look up"
              )}
            </button>
          </div>

          {aiExplanation && (
            <div id="vocab-ai-report" className="bg-white border border-[#DDE0FA] rounded-lg p-4 space-y-3.5 animate-fade-in text-[#37352F]">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F1EF]">
                <span className="text-sm font-bold">{aiExplanation.word}</span>
                <span className="text-[9px] bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] font-bold px-2 py-0.5 rounded">
                  {aiExplanation.difficulty}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[9px] text-[#7A7A78] font-bold uppercase block mb-0.5">Meaning</span>
                  <p className="font-bold">{aiExplanation.translation}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[#7A7A78] font-bold uppercase block mb-0.5">Synonyms</span>
                  <p className="font-mono">{aiExplanation.synonyms.join(", ")}</p>
                </div>
              </div>
              <p className="text-xs text-[#5F5E5B]">{aiExplanation.explanation}</p>
              <p className="text-[11px] text-[#2D6A53] bg-[#EAF5F1] p-2 rounded border border-[#D1EBE1]">
                <strong>Exam note:</strong> {aiExplanation.examSignificance}
              </p>
              <div className="space-y-1.5">
                {aiExplanation.examples.map((ex, i) => (
                  <div key={i} className="bg-[#FAFAF9] p-2.5 rounded border border-[#E9E9E7] text-xs">
                    <p className="font-bold">"{ex.french}"</p>
                    <p className="text-[10px] text-[#7A7A78] italic mt-0.5">{ex.english}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {apiError && (
            <div className="bg-[#FCECF0] border border-[#F8D4DE] text-xs p-3 rounded-lg text-[#B83E5C] flex gap-2 items-center">
              <AlertCircle className="w-4 h-4" />
              <p>{apiError}</p>
            </div>
          )}
        </div>
      </div>

      {mode === "browse" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg px-2.5 py-1">
              <span className="text-[10px] uppercase font-bold text-[#7A7A78] mr-2">Level:</span>
              <div className="flex gap-1 flex-wrap">
                {CEFR_LEVELS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDifficulty(d)}
                    className={`text-[11px] px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                      selectedDifficulty === d
                        ? "bg-white shadow-xs text-[#37352F] font-bold"
                        : "text-[#7B7B79] hover:text-[#37352F]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg px-2.5 py-1">
              <span className="text-[10px] uppercase font-bold text-[#7A7A78] mr-2">Deck:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold text-[#37352F] outline-none cursor-pointer max-w-[200px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.map((item) => {
              const isFlipped = !!flippedCards[item.id];
              return (
                <div key={item.id} className="group h-[190px]" style={{ perspective: "1000px" }}>
                  <div
                    onClick={() => handleFlip(item.id)}
                    className={`relative w-full h-full text-left transition-all duration-500 rounded-xl border cursor-pointer ${
                      isFlipped ? "bg-[#FAFAF9]" : "bg-white"
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      boxShadow: "0 1px 2.5px rgba(15, 15, 15, 0.04)",
                      borderColor: isFlipped ? "#D2E3FC" : "#E9E9E7",
                    }}
                  >
                    <div
                      className="absolute inset-0 p-4 flex flex-col justify-between"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-[#F1F1EF] border border-[#E9E9E7] px-2 py-0.5 rounded text-[#5F5E5B]">
                          {item.difficulty}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleToggleMastery(item.id, item.mastered);
                          }}
                          className={`p-1 rounded transition-all cursor-pointer border ${
                            item.mastered
                              ? "bg-[#EAF5F1] border-[#2D6A53] text-[#2D6A53]"
                              : "bg-white border-[#E9E9E7] text-[#7B7B79]"
                          }`}
                          title={item.mastered ? "Mastered" : "Mark mastered"}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-[#37352F] text-center px-2">
                        {item.word}
                      </h4>
                      <div className="text-[9px] text-[#9B9A97] font-mono uppercase truncate">
                        {item.category}
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 p-4 flex flex-col justify-between bg-[#EBF3FC] rounded-xl text-[#1D74B4] overflow-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <p className="text-xs font-bold text-[#1E3A8A] text-center leading-relaxed">
                        {item.translation}
                      </p>
                      {item.exampleSentence && (
                        <p className="text-[10px] text-[#55698B] italic text-center line-clamp-3">
                          {item.exampleSentence}
                        </p>
                      )}
                      <p className="text-[9px] text-[#55698B] font-mono text-center">Tap to flip</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
