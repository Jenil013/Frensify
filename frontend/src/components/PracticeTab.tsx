import React, { useState, useEffect } from "react";
import { 
  BookOpen, Headphones, PenTool, Mic, Lock, ArrowRight, Sparkles, AlertCircle, ChevronRight, 
  Play, Pause, RotateCcw, Volume2, Check, X, CheckCircle, Info, Loader2, RefreshCw
} from "lucide-react";
import {
  UserProfile,
  ExerciseItem,
  SkillType,
  AIWritingCorrection,
  AISpeakingSuggestion,
  TcfModuleCompletionResult,
  TcfModuleId,
} from "../types";
import { evaluateWriting, evaluateSpeaking } from "../api";
import { TCF_MODULE_REGISTRY } from "../tcfConstants";
import TcfModuleSession from "./tcf/TcfModuleSession";

interface PracticeTabProps {
  profile: UserProfile;
  exercises: ExerciseItem[];
  onCompleteExercise: (exerciseId: string) => void;
  onNavigateToPricing: () => void;
}

export default function PracticeTab({
  profile,
  exercises,
  onCompleteExercise,
  onNavigateToPricing,
}: PracticeTabProps) {
  const [activeSkill, setActiveSkill] = useState<SkillType>("reading");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  
  // MCQ state
  const [chosenChoiceIndex, setChosenChoiceIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Audio simulation state for Listening
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);

  // Speaking simulation state
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparationTimeLeft, setPreparationTimeLeft] = useState(15);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [speakingFeedback, setSpeakingFeedback] = useState<AISpeakingSuggestion | null>(null);
  const [loadingSpeakingFeedback, setLoadingSpeakingFeedback] = useState(false);

  // Writing state
  const [writtenEssay, setWrittenEssay] = useState("");
  const [writingFeedback, setWritingFeedback] = useState<AIWritingCorrection | null>(null);
  const [loadingWritingFeedback, setLoadingWritingFeedback] = useState(false);

  // General error
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTcfModule, setActiveTcfModule] = useState<TcfModuleId | null>(null);
  const [moduleCompleteMsg, setModuleCompleteMsg] = useState<string | null>(null);

  const skillToTcfModule: Record<SkillType, TcfModuleId> = {
    reading: "comprehension-ecrite",
    listening: "comprehension-orale",
    writing: "expression-ecrite",
    speaking: "expression-orale",
  };

  const getWritingMinWords = (ex: ExerciseItem): number => {
    if (ex.id === "w1") return 200;
    if (ex.id === "w2") return 250;
    return 200;
  };

  // Timer effects
  useEffect(() => {
    let prepTimer: NodeJS.Timeout;
    if (isPreparing && preparationTimeLeft > 0) {
      prepTimer = setTimeout(() => setPreparationTimeLeft(prev => prev - 1), 1000);
    } else if (isPreparing && preparationTimeLeft === 0) {
      setIsPreparing(false);
      setIsRecording(true);
      setRecordingSeconds(0);
    }
    return () => clearTimeout(prepTimer);
  }, [isPreparing, preparationTimeLeft]);

  useEffect(() => {
    let recordTimer: NodeJS.Timeout;
    if (isRecording) {
      recordTimer = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(recordTimer);
  }, [isRecording]);

  useEffect(() => {
    let audioTimer: NodeJS.Timeout;
    if (isPlayingAudio) {
      audioTimer = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2 * audioSpeed;
        });
      }, 250);
    }
    return () => clearInterval(audioTimer);
  }, [isPlayingAudio, audioSpeed]);

  const handleSelectExercise = (ex: ExerciseItem) => {
    // Subscription Gate logic
    const isLocked = isExerciseLocked(ex);
    if (isLocked) {
      onNavigateToPricing();
      return;
    }
    setSelectedExercise(ex);
    
    // Reset all task states
    setChosenChoiceIndex(null);
    setIsAnswerSubmitted(false);
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setShowTranscript(false);
    setIsPreparing(false);
    setIsRecording(false);
    setSpokenTranscript("");
    setSpeakingFeedback(null);
    setWrittenEssay("");
    setWritingFeedback(null);
    setApiError(null);
  };

  const isExerciseLocked = (ex: ExerciseItem): boolean => {
    if (profile.tier === "Max") return false;
    if (profile.tier === "Pro") {
      return !!ex.isMax;
    }
    // Free Tier limits
    return !!(ex.isPremium || ex.isMax);
  };

  const handleMCQSubmit = () => {
    if (chosenChoiceIndex === null || !selectedExercise) return;
    setIsAnswerSubmitted(true);
    if (chosenChoiceIndex === selectedExercise.correctChoiceIndex) {
      onCompleteExercise(selectedExercise.id);
    }
  };

  const handleTranscribefallback = () => {
    if (!selectedExercise) return;
    if (selectedExercise.id === "s1") {
      setSpokenTranscript("Bonjour, je vous appelle concernant votre annonce pour des ateliers de poterie. Je voudrais savoir s'il reste des places libres pour le cours de jeudi soir. De plus, est-ce que les outils et l'argile sont inclus dans le coût ? Je vous remercie.");
    } else {
      setSpokenTranscript("D'après moi, le système de prêt de livres partagé est très utile car il évite de gaspiller le papier. Tout d'abord, c'est gratuit et ça favorise les contacts entre voisins. Néanmoins, je comprends ton avis sur l'hygiène, mais on peut laver les mains après la lecture. Tu devrais y participer.");
    }
  };

  const handleProcessSpeakingAI = async () => {
    if (!selectedExercise || !spokenTranscript.trim()) return;
    setLoadingSpeakingFeedback(true);
    setApiError(null);
    try {
      const res = await evaluateSpeaking(
        selectedExercise.prompt,
        spokenTranscript,
        15, // prep seconds
        recordingSeconds || 45, // speaking seconds
        profile.targetExam
      );
      setSpeakingFeedback(res);
      onCompleteExercise(selectedExercise.id);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Speaking evaluation failed. Please check your credentials.");
    } finally {
      setLoadingSpeakingFeedback(false);
    }
  };

  const handleProcessWritingAI = async () => {
    if (!selectedExercise || !writtenEssay.trim()) return;
    setLoadingWritingFeedback(true);
    setApiError(null);
    try {
      const res = await evaluateWriting(
        selectedExercise.prompt,
        writtenEssay,
        selectedExercise.id,
        profile.targetExam
      );
      setWritingFeedback(res);
      onCompleteExercise(selectedExercise.id);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Essay diagnostics failed. Please confirm your API key registration.");
    } finally {
      setLoadingWritingFeedback(false);
    }
  };

  // Filter exercises relevant to the active exam type and active skill
  const filteredExercises = exercises.filter(
    ex => ex.examType === profile.targetExam && ex.skill === activeSkill
  );

  const handleTcfModuleComplete = (result: TcfModuleCompletionResult) => {
    if (result.type === "mcq") {
      setModuleCompleteMsg(
        `Module complete: ${result.result.rawScore}/${result.result.maxScore} (+1/0)`
      );
    } else if (result.type === "writing") {
      const a = result.result.sections[0]?.feedback?.cefrScore ?? "—";
      const b = result.result.sections[1]?.feedback?.cefrScore ?? "—";
      setModuleCompleteMsg(`Writing module complete — Section A: ${a}, B: ${b}`);
    } else {
      const a = result.result.sections[0]?.feedback?.cefrLevel ?? "—";
      const b = result.result.sections[1]?.feedback?.cefrLevel ?? "—";
      setModuleCompleteMsg(`Oral module complete — Section A: ${a}, B: ${b}`);
    }
    setActiveTcfModule(null);
  };

  if (activeTcfModule) {
    return (
      <div id="practice-tab" className="space-y-4 animate-fade-in text-[#37352F]">
        <TcfModuleSession
          moduleId={activeTcfModule}
          examType={profile.targetExam}
          examMode={false}
          onAbort={() => setActiveTcfModule(null)}
          onComplete={handleTcfModuleComplete}
        />
      </div>
    );
  }

  const tcfModuleMeta = TCF_MODULE_REGISTRY[skillToTcfModule[activeSkill]];

  return (
    <div id="practice-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Skills Training Center</h2>
          <p className="text-xs text-[#7A7A78]">Train on syllabus questions aligned with CEFR grading grids.</p>
        </div>

        {/* Skill selectors buttons - Notion segment control style */}
        <div className="flex items-center gap-1 p-1 bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg">
          {(["reading", "listening", "speaking", "writing"] as SkillType[]).map((skill) => {
            const Icon = {
              reading: BookOpen,
              listening: Headphones,
              speaking: Mic,
              writing: PenTool
            }[skill];
            return (
              <button
                key={skill}
                onClick={() => {
                  setActiveSkill(skill);
                  setSelectedExercise(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                  activeSkill === skill 
                    ? "bg-white shadow-sm border border-[#E9E9E7] text-[#37352F] font-semibold" 
                    : "text-[#5F5E5B] hover:text-[#37352F]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {moduleCompleteMsg && (
        <div className="bg-[#EAF5F1] border border-[#D1EBE1] rounded-lg p-3 text-xs text-[#2D6A53] font-medium">
          {moduleCompleteMsg}
          <button
            type="button"
            onClick={() => setModuleCompleteMsg(null)}
            className="ml-2 text-[#1D74B4] font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {profile.targetExam === "TCF" && !selectedExercise && (
        <div className="bg-[#EBF3FC] border border-[#D2E7F6] rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#1D74B4] tracking-wide">
              Full TCF module
            </p>
            <h3 className="text-sm font-bold text-[#1E3A8A] mt-1">
              {tcfModuleMeta.meta.labelFr}
            </h3>
            <p className="text-xs text-[#3B4C7C] mt-1 max-w-xl">
              {tcfModuleMeta.meta.objective} — {tcfModuleMeta.meta.durationMinutes}{" "}
              min
              {tcfModuleMeta.meta.questionCount
                ? ` · ${tcfModuleMeta.meta.questionCount} questions (+1/0)`
                : " · Sections A & B"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (profile.tier === "Free") {
                onNavigateToPricing();
                return;
              }
              setActiveTcfModule(skillToTcfModule[activeSkill]);
              setModuleCompleteMsg(null);
            }}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
          >
            Start full module
          </button>
        </div>
      )}

      {!selectedExercise ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map((ex) => {
            const locked = isExerciseLocked(ex);
            return (
              <div 
                key={ex.id} 
                onClick={() => handleSelectExercise(ex)}
                className={`bg-white border border-[#E9E9E7] hover:border-[#1A73E8]/50 cursor-pointer rounded-xl p-5 shadow-premium hover:shadow-premium-lg transition-all relative overflow-hidden flex flex-col justify-between group h-52`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-[#F1F1EF] text-[#5F5E5B] border border-[#E9E9E7] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      {ex.difficulty}
                    </span>
                    {locked ? (
                      <span className="flex items-center gap-1 bg-[#FDF3E7] text-[#9A5013] text-[9.5px] uppercase font-bold px-2 py-0.5 rounded border border-[#FCE1CA]">
                        <Lock className="w-2.5 h-2.5" /> Pro
                      </span>
                    ) : (
                      <span className="bg-[#EAF5F1] text-[#2D6A53] text-[9.5px] uppercase font-bold px-2 py-0.5 rounded border border-[#D1EBE1]">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#37352F] group-hover:text-[#1A73E8] transition-colors line-clamp-1">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-[#7A7A78] line-clamp-3 leading-relaxed mt-1.5">
                    {ex.prompt}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#F1F1EF]">
                  <span className="text-[10px] text-[#9B9A97] font-mono">⏱️ ~{ex.durationMinutes} min activity</span>
                  <button className="text-[11px] font-bold text-[#1D74B4] group-hover:text-[#1A73E8] flex items-center gap-1">
                    {locked ? "Unlock Access" : "Launch Activity"}{" "}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Exercise Simulation workspace UI */
        <div className="bg-white border border-[#E9E9E7] rounded-xl p-6 shadow-premium-lg space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#F1F1EF]">
            <button 
              onClick={() => setSelectedExercise(null)}
              className="text-xs font-bold text-[#5F5E5B] hover:text-[#37352F] transition-colors flex items-center gap-1 cursor-pointer"
            >
              ← Back to activity list
            </button>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9A97] px-2 py-0.5 bg-[#F1F1EF] rounded border border-[#E9E9E7]">
              {selectedExercise.examType} Activity &bull; {selectedExercise.skill}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#37352F]">{selectedExercise.title}</h3>
            <p className="text-xs text-[#5F5E5B] mt-1.5 bg-[#FAFAF9] px-3 py-2 rounded-lg border border-[#E9E9E7]/80 leading-relaxed">
              <strong>Objective:</strong> {selectedExercise.prompt}
            </p>
          </div>

          {/* LISTENING PLAYER WORKSPACE */}
          {selectedExercise.skill === "listening" && (
            <div className="space-y-4">
              <div className="bg-[#EBF3FC] border border-[#D2E7F6] rounded-xl p-5">
                <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isPlayingAudio ? "bg-[#B83E5C] text-white" : "bg-[#1A73E8] text-white hover:scale-105"
                      }`}
                    >
                      {isPlayingAudio ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-[#1D74B4]">TEF/TCF Listening Simulation Feed</p>
                      <p className="text-[10px] text-[#55698B]">Real examination tempo with custom speeds</p>
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setAudioSpeed(s => s === 1 ? 0.8 : s === 0.8 ? 1.2 : 1)}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-[#CDDFD9] rounded hover:bg-[#FAFAF9] text-[#37352F] cursor-pointer"
                    >
                      Speed: {audioSpeed}x
                    </button>
                    <button 
                      onClick={() => {
                        setIsPlayingAudio(false);
                        setAudioProgress(0);
                      }}
                      className="text-[11px] font-semibold p-1.5 bg-white border border-[#CDDFD9] rounded hover:bg-[#FAFAF9] cursor-pointer"
                      title="Reset playback"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#5F5E5B]" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-white/60 rounded overflow-hidden">
                    <div className="h-full bg-[#1A73E8] transition-all duration-300" style={{ width: `${audioProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#55698B] mt-1.5 font-mono">
                    <span>0:00</span>
                    <span>Continuous playback...</span>
                    <span>1:12</span>
                  </div>
                </div>
              </div>

              {/* Show transcription helper */}
              <div>
                <button 
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs font-bold text-[#1D74B4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" /> {showTranscript ? "Hide Transcript Assist" : "Show Transcript Assist (Visual Aid)"}
                </button>
                {showTranscript && (
                  <div className="mt-2.5 p-3.5 bg-[#FAFAF9] border border-[#E9E9E7] text-xs text-[#5F5E5B] leading-relaxed rounded-lg italic">
                    {selectedExercise.transcript}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* READING PASSAGE WORKSPACE */}
          {selectedExercise.passage && (
            <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-5 hover:not-italic text-xs md:text-sm text-[#37352F] leading-relaxed max-h-[260px] overflow-y-auto">
              {selectedExercise.passage}
            </div>
          )}

          {/* WRITING WORKSPACE */}
          {selectedExercise.skill === "writing" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">Draft your argumentative French response below:</label>
                <textarea
                  id="textarea-essay"
                  value={writtenEssay}
                  onChange={(e) => setWrittenEssay(e.target.value)}
                  placeholder="Commencez à rédiger votre essai en français ici..."
                  rows={8}
                  className="w-full text-xs md:text-sm p-4 border border-[#E9E9E7] rounded-xl outline-none focus:border-[#1A73E8] bg-[#FAFAF9] focus:bg-white transition-all text-[#37352F] font-mono leading-relaxed"
                ></textarea>
                <div className="flex justify-between text-[11px] text-[#7A7A78] font-mono">
                  <span>Words: <strong className={writtenEssay.split(/\s+/).filter(Boolean).length >= getWritingMinWords(selectedExercise) ? "text-[#10B981]" : ""}>{writtenEssay.split(/\s+/).filter(Boolean).length}</strong> / {getWritingMinWords(selectedExercise)} min</span>
                  <span>Letters: {writtenEssay.length}</span>
                </div>
              </div>

              {writingFeedback && (
                <div id="writing-feedback-view" className="bg-[#EAF5F1] border border-[#D1EBE1] rounded-xl p-5 space-y-4 animate-fade-in text-[#2D6A53]">
                  <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[#D1EBE1] gap-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-[#2D6A53]" />
                      <h4 className="font-bold text-[#2D6A53] text-[13px] uppercase tracking-wide">Frensify AI Grader Feedback</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase bg-white border border-[#D1EBE1] px-2 py-0.5 rounded text-[#2D6A53]">
                        CEFR Rank: {writingFeedback.cefrScore}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-[#2D6A53] px-2 py-0.5 rounded text-white">
                        TEF/TCF score: {writingFeedback.scoreRange} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed"><strong>Summary Review:</strong> {writingFeedback.overallFeedback}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(writingFeedback.dimensionScores).map(([dim, note]) => (
                      <div key={dim} className="bg-white border border-[#D1EBE1]/60 rounded-lg p-3 shadow-sm text-[#37352F]">
                        <span className="text-[9px] font-bold text-[#7A7A78] uppercase block mb-0.5">{dim}</span>
                        <p className="text-[11px] leading-relaxed">{note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#D1EBE1]/60 pt-3 space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider">Targeted Grammatical Overviews</h5>
                    <div className="space-y-2">
                      {writingFeedback.detailedCorrections.map((corr, idx) => (
                        <div key={idx} className="bg-white border border-[#D1EBE1]/40 rounded-lg p-3 text-xs text-[#37352F] space-y-1">
                          <p className="text-[#B83E5C] line-through">❌ "{corr.original}"</p>
                          <p className="text-[#2D6A53] font-bold">✅ "{corr.corrected}"</p>
                          <p className="text-[#5F5E5B] text-[11px] bg-[#FAFAF9] p-2 rounded border border-[#E9E9E7]/60 leading-normal mt-1">
                            <strong>Feedback:</strong> {corr.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#D1EBE1]/60 pt-3 space-y-1.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider">Pro Target Blueprint Model:</h5>
                    <div className="bg-white border border-[#D1EBE1] text-xs p-3.5 rounded-lg leading-relaxed italic text-[#37352F]">
                      {writingFeedback.improvedVersion}
                    </div>
                  </div>
                </div>
              )}

              {apiError && (
                <div className="bg-[#FCECF0] border border-[#F8D4DE] text-xs p-3.5 rounded-lg text-[#B83E5C] flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 text-[#B83E5C]" />
                  <p>{apiError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  id="btn-evaluate-writing"
                  onClick={handleProcessWritingAI}
                  disabled={loadingWritingFeedback || !writtenEssay.trim()}
                  className="px-4 py-2.5 bg-[#4573E3] hover:bg-[#3459C2] text-white disabled:bg-[#FAFAF9] disabled:text-[#A1A1AA] disabled:border-[#E9E9E7] border border-transparent rounded-lg font-bold transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
                >
                  {loadingWritingFeedback ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scoring Draft Essay...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Submit to AI Diagnostic Grader
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SPEAKING WORKSPACE */}
          {selectedExercise.skill === "speaking" && (
            <div className="space-y-4">
              <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-xl p-5 space-y-4">
                
                {/* Simulated Speech controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#7A7A78]">Oral Speech Booth Tool</h4>
                    <p className="text-[11px] text-[#9B9A97] mt-0.5">Adjust countdown parameters and simulate speaking time constraints.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPreparing && !isRecording && (
                      <button 
                        onClick={() => {
                          setIsPreparing(true);
                          setPreparationTimeLeft(15);
                          setSpeakingFeedback(null);
                        }}
                        className="px-3 py-1.5 bg-white border border-[#E9E9E7] text-xs rounded-lg font-bold text-[#37352F] hover:bg-[#F1F1EF] transition-all cursor-pointer"
                      >
                        Initiate 15s Prep Guide
                      </button>
                    )}

                    {isPreparing && (
                      <div className="flex items-center gap-2 bg-[#FDF3E7] border border-[#FCE1CA] text-xs px-3.5 py-1.5 rounded-lg text-[#9A5013] font-bold animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Preparing Response: {preparationTimeLeft}s
                      </div>
                    )}

                    {isRecording && (
                      <div className="flex items-center gap-2 bg-[#FCECF0] border border-[#F8D4DE] text-xs px-3.5 py-1.5 rounded-lg text-[#B83E5C] font-bold">
                        <span className="w-2 h-2 bg-[#B83E5C] rounded-full animate-ping"></span>
                        Recording: {recordingSeconds}s
                      </div>
                    )}

                    {(isPreparing || isRecording) && (
                      <button
                        onClick={() => {
                          setIsPreparing(false);
                          setIsRecording(false);
                        }}
                        className="px-2 py-1 bg-white border border-[#E9E9E7] hover:bg-[#F1F1EF] rounded text-xs cursor-pointer text-[#5F5E5B]"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Microphone Visual Wavebar simulation */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-1 h-12 bg-white border border-[#E9E9E7] rounded-lg overflow-hidden px-10">
                    {[3, 8, 4, 12, 16, 8, 6, 14, 11, 7, 10, 4, 8, 15, 5, 2, 7, 11, 4, 9, 14, 3, 1].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-[#B83E5C] rounded-full transition-all duration-300"
                        style={{ height: `${h * 1.5 + Math.random() * 5}px` }}
                      ></div>
                    ))}
                  </div>
                )}

                {/* Transcript simulation block */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">Automated Text Transcript Assist:</label>
                    <button 
                      onClick={handleTranscribefallback}
                      className="text-[10.5px] font-bold text-[#1D74B4] hover:underline"
                    >
                      💡 Use Simulated Audio Transcription
                    </button>
                  </div>
                  <textarea
                    id="textarea-speaking"
                    value={spokenTranscript}
                    onChange={(e) => setSpokenTranscript(e.target.value)}
                    placeholder="Enregistrez votre réponse orale ou renseignez votre transcription pour obtenir l'évaluation IA détaillée..."
                    rows={4}
                    className="w-full text-xs p-3 border border-[#E9E9E7] outline-none rounded-lg bg-white text-[#37352F] font-mono leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {speakingFeedback && (
                <div id="speaking-feedback-view" className="bg-[#EEEFFC] border border-[#DDE0FA] rounded-xl p-5 space-y-4 animate-fade-in text-[#37352F]">
                  <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[#DDE0FA] gap-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-[#4A55A2]" />
                      <h4 className="font-bold text-[#4A55A2] text-[13px] uppercase tracking-wide">Speaking Coach Assessment</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-[#4A55A2] px-2 py-0.5 rounded text-white">
                      Estimated CEFR: {speakingFeedback.cefrLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-[#DDE0FA]/60 rounded-lg p-3 shadow-sm">
                      <span className="text-[9px] font-bold text-[#7A7A78] uppercase block mb-0.5">Fluency & Tempo</span>
                      <p className="text-[11px] leading-relaxed text-[#37352F]">{speakingFeedback.fluencyFeedback}</p>
                    </div>
                    <div className="bg-white border border-[#DDE0FA]/60 rounded-lg p-3 shadow-sm">
                      <span className="text-[9px] font-bold text-[#7A7A78] uppercase block mb-0.5">Grammar & Structure</span>
                      <p className="text-[11px] leading-relaxed text-[#37352F]">{speakingFeedback.grammarAndVocab}</p>
                    </div>
                    <div className="bg-white border border-[#DDE0FA]/60 rounded-lg p-3 shadow-sm">
                      <span className="text-[9px] font-bold text-[#7A7A78] uppercase block mb-0.5">Coherence Metric</span>
                      <p className="text-[11px] leading-relaxed text-[#37352F]">{speakingFeedback.structureAnalysis}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3.5 border border-[#DDE0FA]/60">
                    <h5 className="text-[10px] font-bold uppercase text-[#4A55A2] mb-1.5">Pronunciation & Rhythm Coaching:</h5>
                    <ul className="list-disc pl-4 text-xs text-[#5F5E5B] space-y-1">
                      {speakingFeedback.pronunciationTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#4A55A2]">Recommended Vocabulary Connectors:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {speakingFeedback.suggestedPhrases.map((phrase, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3.5 border border-[#DDE0FA] text-xs">
                          <p className="font-bold text-[#4A55A2]">"{phrase.french}"</p>
                          <p className="text-[11px] text-[#7B7B79] italic mt-0.5">Meaning: {phrase.english}</p>
                          <p className="text-[10px] text-[#5F5E5B] mt-1">{phrase.context}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#DDE0FA] text-xs p-3.5 rounded-lg leading-relaxed italic text-[#37352F]">
                    <p className="font-bold text-[10px] text-[#4A55A2] not-italic mb-1.5 uppercase">Reference Spoken Brief Model:</p>
                    {speakingFeedback.modelSpokenDraft}
                  </div>
                </div>
              )}

              {apiError && (
                <div className="bg-[#FCECF0] border border-[#F8D4DE] text-xs p-3.5 rounded-lg text-[#B83E5C] flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 text-[#B83E5C]" />
                  <p>{apiError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  id="btn-evaluate-speaking"
                  onClick={handleProcessSpeakingAI}
                  disabled={loadingSpeakingFeedback || !spokenTranscript.trim()}
                  className="px-4 py-2.5 bg-[#4573E3] hover:bg-[#3459C2] text-white disabled:bg-[#FAFAF9] disabled:text-[#A1A1AA] disabled:border-[#E9E9E7] border border-transparent rounded-lg font-bold transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
                >
                  {loadingSpeakingFeedback ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing Pronunciation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Grade and Diagnose Speech Audio
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* MULTIPLE CHOICE QUESTIONS FOR READING / LISTENING */}
          {selectedExercise.questionType === "multiple-choice" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">Select the correct alternative:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedExercise.choices?.map((choice, i) => {
                    const isSelected = chosenChoiceIndex === i;
                    const isCorrect = selectedExercise.correctChoiceIndex === i;
                    
                    let cardBg = "bg-white hover:bg-[#FAFAF9] border-[#E9E9E7] text-[#37352F]";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        cardBg = "bg-[#EAF5F1] border-[#2D6A53] text-[#2D6A53]";
                      } else if (isSelected) {
                        cardBg = "bg-[#FCECF0] border-[#B83E5C] text-[#B83E5C]";
                      }
                    } else if (isSelected) {
                      cardBg = "bg-[#EBF3FC] border-[#1A73E8] text-[#1D74B4]";
                    }

                    return (
                      <button
                        key={i}
                        disabled={isAnswerSubmitted}
                        onClick={() => setChosenChoiceIndex(i)}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs font-semibold transition-all flex justify-between items-center cursor-pointer ${cardBg}`}
                      >
                        <span>{choice}</span>
                        {isAnswerSubmitted && isCorrect && <Check className="w-4 h-4 text-[#2D6A53]" />}
                        {isAnswerSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-[#B83E5C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAnswerSubmitted && (
                <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-4 text-xs text-[#5F5E5B] space-y-1">
                  <div className="flex gap-1.5 items-center text-[#37352F] font-bold">
                    <Info className="w-3.5 h-3.5 text-[#1D74B4]" />
                    <span>Linguistic Analysis & Solution Breakdowns:</span>
                  </div>
                  <p className="leading-relaxed italic mt-1">{selectedExercise.explanation}</p>
                </div>
              )}

              {!isAnswerSubmitted ? (
                <div className="pt-2">
                  <button
                    id="btn-submit-exercise"
                    disabled={chosenChoiceIndex === null}
                    onClick={handleMCQSubmit}
                    className="px-4 py-2 bg-[#37352F] hover:bg-black text-white disabled:bg-[#F1F1EF] disabled:text-[#A1A1AA] rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Submit and Verification
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="px-4 py-2 bg-[#FAFAF9] border border-[#E9E9E7] hover:bg-[#F1F1EF] text-[#37352F] rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Finish Drill Exercise
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
