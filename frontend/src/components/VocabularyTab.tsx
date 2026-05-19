import React, { useState } from "react";
import { Sparkles, Check, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { UserProfile, VocabularyCard } from "../types";
import { getVocabExplanation, VocabExplanation } from "../api";

interface VocabularyTabProps {
  profile: UserProfile;
  vocabList: VocabularyCard[];
  onToggleMastery: (id: string) => void;
  onAddVocab: (word: string, translation: string, diff: any, cat: string) => void;
}

export default function VocabularyTab({
  profile,
  vocabList,
  onToggleMastery,
  onAddVocab,
}: VocabularyTabProps) {
  // Flip states keyed by card ID
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Custom AI search states
  const [searchWord, setSearchWord] = useState("");
  const [loadingAIExplain, setLoadingAIExplain] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<VocabExplanation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAskAIExplanation = async () => {
    if (!searchWord.trim()) return;
    setLoadingAIExplain(true);
    setApiError(null);
    setAiExplanation(null);
    try {
      const res = await getVocabExplanation(searchWord.trim());
      setAiExplanation(res);
      
      // Auto-add searched word to user list
      const wordAlreadyExists = vocabList.some(v => v.word.toLowerCase() === res.word.toLowerCase());
      if (!wordAlreadyExists) {
        onAddVocab(
          res.word,
          res.translation,
          res.difficulty.includes("B2") ? "B2" : res.difficulty.includes("C1") ? "C1" : "B2",
          "AI Generated"
        );
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Could not fetch AI advice. Please declare your key.");
    } finally {
      setLoadingAIExplain(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(vocabList.map(v => v.category)))];
  const difficulties = ["All", "B1", "B2", "C1"];

  const filteredVocab = vocabList.filter(v => {
    const diffMatch = selectedDifficulty === "All" || v.difficulty === selectedDifficulty;
    const catMatch = selectedCategory === "All" || v.category === selectedCategory;
    return diffMatch && catMatch;
  });

  return (
    <div id="vocabulary-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Vocabulary Database</h2>
          <p className="text-xs text-[#7A7A78]">Catalog advanced French idioms, collocations, and high-scoring argument connector codes.</p>
        </div>

        {/* Filters - Minimalist Notion bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg px-2.5 py-1">
            <span className="text-[10px] uppercase font-bold text-[#7A7A78] mr-2">Level:</span>
            <div className="flex gap-1">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`text-[11px] px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    selectedDifficulty === d ? "bg-white shadow-xs text-[#37352F] font-bold" : "text-[#7B7B79] hover:text-[#37352F]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg px-2.5 py-1">
            <span className="text-[10px] uppercase font-bold text-[#7A7A78] mr-2">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-[#37352F] outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Vocab Lookup helper section (Sleek Lilac Callout Block) */}
      <div className="bg-[#EEEFFC] border border-[#DDE0FA] rounded-xl p-5 shadow-premium">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4A55A2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A55A2]">French Structural Analyst Engine</h3>
          </div>
          <p className="text-xs text-[#5C649E] leading-relaxed">
            Enter any advanced expression (e.g. <em>concomitant</em>, <em>néanmoins</em>, <em>à l'instar d'eux</em>) to dissect scoring potential and generate contextual CEFR blueprint examples.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              id="input-ai-vocab"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Ex: d'autant plus que, dorénavant, fâcheux..."
              className="flex-1 px-3 py-1.5 text-xs border border-[#DDE0FA] bg-white rounded-lg placeholder-[#4A55A2]/30 outline-none text-[#37352F] focus:border-[#4A55A2]"
              onKeyDown={(e) => e.key === "Enter" && handleAskAIExplanation()}
            />
            <button
              id="btn-ai-explain-vocab"
              onClick={handleAskAIExplanation}
              disabled={loadingAIExplain || !searchWord.trim()}
              className="px-4 py-1.5 bg-[#4A55A2] hover:bg-[#343D84] disabled:bg-[#DDE0FA] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {loadingAIExplain ? (
                <>
                  <Loader2 className="w-3 animate-spin" /> Analyzing...
                </>
              ) : (
                <>Dissect & Catalog</>
              )}
            </button>
          </div>

          {/* Render AI Result */}
          {aiExplanation && (
            <div id="vocab-ai-report" className="bg-white border border-[#DDE0FA] rounded-lg p-4 space-y-3.5 animate-fade-in text-[#37352F]">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F1EF]">
                <span className="text-sm font-bold text-[#37352F]">{aiExplanation.word}</span>
                <div className="flex gap-1.5">
                  <span className="text-[9px] bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] font-bold px-2 py-0.5 rounded">
                    {aiExplanation.difficulty}
                  </span>
                  <span className="text-[9px] bg-[#F1F1EF] text-[#7B7B79] border border-[#E9E9E7] px-2 py-0.5 rounded font-mono">
                    Added to Active Deck
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[9px] text-[#7A7A78] font-bold uppercase mb-0.5 block">English Meaning</span>
                  <p className="font-bold text-[#37352F]">{aiExplanation.translation}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[#7A7A78] font-bold uppercase mb-0.5 block">High Level Synonyms</span>
                  <p className="text-[#37352F] font-mono">{aiExplanation.synonyms.join(", ")}</p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-[9px] text-[#7A7A78] font-bold uppercase block">CEFR Accentuation Note</span>
                <p className="text-[#5F5E5B] leading-relaxed">{aiExplanation.explanation}</p>
                <p className="text-[11px] text-[#2D6A53] bg-[#EAF5F1] p-2 rounded border border-[#D1EBE1] font-mono leading-normal">
                  <strong>Assessment Strategy:</strong> {aiExplanation.examSignificance}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] text-[#7A7A78] font-bold uppercase block">Oral/Written Practice Patterns</span>
                {aiExplanation.examples.map((ex, i) => (
                  <div key={i} className="bg-[#FAFAF9] p-2.5 rounded border border-[#E9E9E7] text-xs">
                    <p className="font-bold text-[#37352F]">“ {ex.french} ”</p>
                    <p className="text-[10px] text-[#7A7A78] italic mt-0.5">Translation: {ex.english}</p>
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

      {/* Cards List Grid (Beautiful interactive Notion Index Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocab.map((item) => {
          const isFlipped = !!flippedCards[item.id];
          
          return (
            <div 
              key={item.id}
              className="group h-[170px]"
              style={{ perspective: "1000px" }}
            >
              {/* Card Container for 3D simulation flipping */}
              <div 
                onClick={() => handleFlip(item.id)}
                className={`relative w-full h-full text-left transition-all duration-500 rounded-xl border cursor-pointer ${
                  isFlipped ? "bg-[#FAFAF9]" : "bg-white"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  boxShadow: "0 1px 2.5px rgba(15, 15, 15, 0.04)",
                  borderColor: isFlipped ? "#D2E3FC" : "#E9E9E7"
                }}
              >
                
                {/* CARD FACE FRONT */}
                <div 
                  className="absolute inset-0 p-4 flex flex-col justify-between"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-[#F1F1EF] border border-[#E9E9E7] px-2 py-0.5 rounded text-[#5F5E5B]">
                      {item.difficulty}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // prevent flip
                        onToggleMastery(item.id);
                      }}
                      className={`p-1 rounded transition-all cursor-pointer border ${
                        item.mastered 
                          ? "bg-[#EAF5F1] border-[#2D6A53] text-[#2D6A53]" 
                          : "bg-white border-[#E9E9E7] text-[#7B7B79]"
                      }`}
                      title={item.mastered ? "Mastered! Click to demote" : "Mark as thoroughly Mastered"}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-[#37352F] group-hover:text-[#1A73E8] transition-colors self-center text-center px-2">
                    {item.word}
                  </h4>

                  <div className="flex justify-between items-center text-[9px] text-[#9B9A97] font-mono">
                    <span className="uppercase">{item.category}</span>
                    <span>Tap card to reveal Translation</span>
                  </div>
                </div>

                {/* CARD BACK */}
                <div 
                  className="absolute inset-0 p-4 flex flex-col justify-between bg-[#EBF3FC] rounded-xl text-[#1D74B4]"
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)" 
                  }}
                >
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[9.5px] font-bold uppercase bg-white border border-[#D2E7F6] px-2 py-0.5 rounded text-[#1D74B4]">
                      English Translation
                    </span>
                    <span className="text-[9px] font-mono">{item.difficulty} Indicator</span>
                  </div>

                  <div className="text-center px-2">
                    <p className="text-xs font-bold text-[#1E3A8A] leading-relaxed">{item.translation}</p>
                    <p className="text-[10px] text-[#55698B] mt-1.5 font-mono capitalize">Category: "{item.category}"</p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-[#55698B] font-mono">
                    <span className="truncate max-w-[120px]">{item.word}</span>
                    <span>Click to flip front</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
