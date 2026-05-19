import React, { useState, useEffect } from "react";
import { Lock, FileText, ChevronRight, Play, Award, Timer, ChevronLeft, Info, HelpCircle } from "lucide-react";
import { UserProfile, ExamPathway } from "../types";
import { MOCK_EXAMS_DB } from "../constants";

interface ExamsTabProps {
  profile: UserProfile;
  onNavigateToPricing: () => void;
  onSaveMockScore: (examId: string, name: string, scorePct: number, cefr: string) => void;
}

export default function ExamsTab({
  profile,
  onNavigateToPricing,
  onSaveMockScore,
}: ExamsTabProps) {
  const [activeSessionExam, setActiveSessionExam] = useState<typeof MOCK_EXAMS_DB[0] | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: Reading, 2: Listening, 3: Writing, 4: Finished

  // Exam responses
  const [readingAns, setReadingAns] = useState<number | null>(null);
  const [listeningAns, setListeningAns] = useState<number | null>(null);
  const [writingText, setWritingText] = useState("");

  // Timing
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSessionExam && secondsLeft > 0 && currentStep > 0 && currentStep < 4) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (activeSessionExam && secondsLeft === 0 && currentStep > 0 && currentStep < 4) {
      // Auto submit when times out
      setCurrentStep(4);
      handleFinishExam();
    }
    return () => clearInterval(interval);
  }, [activeSessionExam, secondsLeft, currentStep]);

  const handleStartExam = (exam: typeof MOCK_EXAMS_DB[0]) => {
    // Check Gate logic
    if (profile.tier === "Free") {
      onNavigateToPricing();
      return;
    }
    if (exam.isMaxOnly && profile.tier !== "Max") {
      onNavigateToPricing();
      return;
    }

    setActiveSessionExam(exam);
    setCurrentStep(1); // Go straight into Section 1 (Reading)
    setSecondsLeft(exam.estimatedDurationMin * 60);
    setReadingAns(null);
    setListeningAns(null);
    setWritingText("");
    setIsExamCompleted(false);
  };

  const handleFinishExam = () => {
    if (!activeSessionExam) return;

    // Evaluate answers
    let correctCount = 0;
    if (readingAns === 1) correctCount++; // r1 correct was 1
    if (listeningAns === 1) correctCount++; // l1 correct was 1

    const correctPct = Math.round((correctCount / 2) * 100);
    let estimatedCEFR = "B1";
    if (correctPct === 100) estimatedCEFR = "C1";
    else if (correctPct === 50) estimatedCEFR = "B2";

    // Save mock test score to profile
    onSaveMockScore(
      activeSessionExam.id,
      activeSessionExam.name,
      correctPct,
      estimatedCEFR
    );
    
    setIsExamCompleted(true);
    setCurrentStep(4); // Finished panel
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Filter exams matching pathway
  const matchedExams = MOCK_EXAMS_DB.filter(ex => ex.examType === profile.targetExam);

  return (
    <div id="exams-tab" className="space-y-6 animate-fade-in text-[#37352F]">
      {!activeSessionExam ? (
        /* Exams Index */
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#37352F]">Exam Simulations</h2>
            <p className="text-xs text-[#7A7A78]">Complete chronological multi-section models replicating target test centers.</p>
          </div>

          {profile.tier === "Free" && (
            <div className="bg-[#FDF3E7] border border-[#FCE1CA] rounded-xl p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center shadow-premium">
              <div className="space-y-1">
                <h4 className="font-bold text-[#9A5013] text-sm uppercase tracking-wide">Locked Simulation Simulator Access Enabled For Pro</h4>
                <p className="text-xs text-[#9A5013] leading-relaxed max-w-xl">
                  Free tiers are bounded to vocabulary catalogs. Unlock full timing simulators, structured multi-grid scoring diagnostics, and comprehensive CEFR reports.
                </p>
              </div>
              <button 
                onClick={onNavigateToPricing}
                className="px-4 py-2 bg-[#9A5013] hover:bg-[#834310] text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
              >
                Inspect Lifetime Tiers
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {matchedExams.map((exam) => {
              const maxLocked = exam.isMaxOnly && profile.tier !== "Max";
              const normalLocked = profile.tier === "Free";
              const locked = normalLocked || maxLocked;

              return (
                <div 
                  key={exam.id}
                  className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-premium hover:shadow-premium-lg transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#5F5E5B] tracking-wider uppercase bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E9E9E7]">
                        {exam.examType} PRO SIMULATION
                      </span>
                      {exam.isMaxOnly && (
                        <span className="text-[9px] font-bold bg-[#EEEFFC] text-[#4A55A2] border border-[#DDE0FA] px-2 py-0.5 rounded">
                          MAX TIER
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#37352F]">{exam.name}</h3>
                    <p className="text-xs text-[#7A7A78] leading-relaxed max-w-2xl">{exam.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[#9B9A97] font-mono pt-1">
                      <span>⏱️ {exam.estimatedDurationMin} minutes</span>
                      <span>•</span>
                      <span>📖 {exam.readingsCount} Comprehension Passage</span>
                      <span>•</span>
                      <span>🎧 {exam.listeningsCount} Listening Audio Feed</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {locked ? (
                      <button 
                        onClick={onNavigateToPricing}
                        className="w-full md:w-auto px-4 py-2 bg-[#FAFAF9] hover:bg-[#F1F1EF]/60 border border-[#E9E9E7] rounded-lg text-xs font-bold text-[#7B7B79] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock Test
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartExam(exam)}
                        className="w-full md:w-auto px-4 py-2 bg-[#2D6A53] hover:bg-[#204E3C] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Simulation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Inside Active Exam Workspace UI */
        <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 md:p-6 shadow-premium-xl space-y-5">
          
          {/* Header metadata inside simulator */}
          <div className="flex justify-between items-center pb-3 border-b border-[#F1F1EF]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#37352F] uppercase bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E9E9E7]">{activeSessionExam.name}</span>
              <div className="flex items-center gap-1 bg-[#FCECF0] border border-[#F8D4DE] px-2.5 py-0.5 rounded-lg text-xs text-[#B83E5C] font-bold">
                <Timer className="w-3.5 h-3.5" />
                <span className="font-mono">Time Left: {formatTime(secondsLeft)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Abort this simulation? Your active transcript metrics will be discarded.")) {
                  setActiveSessionExam(null);
                }
              }}
              className="text-xs text-[#B83E5C] font-semibold hover:underline cursor-pointer"
            >
              Abort Test ×
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg overflow-x-auto justify-start sm:justify-start">
            {[1, 2, 3].map((step) => {
              let stepLabel = step === 1 ? "Compréhension Écrite" : step === 2 ? "Compréhension Orale" : "Expression Écrite";
              let tabBg = "text-[#7B7B79] hover:text-[#37352F]";
              
              if (currentStep === step) {
                tabBg = "bg-white text-[#37352F] font-bold border border-[#E9E9E7] shadow-sm";
              } else if (currentStep > step) {
                tabBg = "bg-[#EAF5F1]/80 text-[#2D6A53] border border-[#D1EBE1]/40";
              }

              return (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all tracking-tight shrink-0 flex items-center gap-1 font-medium ${tabBg}`}
                >
                  <span>Sec {step}:</span>
                  <span>{stepLabel}</span>
                </button>
              );
            })}
          </div>

          {/* STEP 1: READING SECTION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-[#FAFAF9] border border-[#E9E9E7] p-5 rounded-lg space-y-4">
                <h4 className="font-bold text-[#37352F] text-xs uppercase tracking-wider">Compréhension Écrite (Reading passage simulation)</h4>
                <p className="text-xs text-[#5F5E5B] leading-relaxed italic border-l-2 border-[#1A73E8] pl-3">
                  "L'ère post-pandémique a propulsé le travail à distance au rang de norme opérationnelle. Néanmoins, cette flexibilité tant louée s'avère être une lame à double tranchant..."
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#7A7A78] uppercase">Question 1: Quelle est la position principale défendue dans l'analyse ?</p>
                  {[
                    "A) Interdire complètement le télétravail.",
                    "B) Encadrer législativement le modèle hybride.",
                    "C) Encourager les salariés à quitter l'entreprise.",
                    "D) Supprimer la cohésion sociale."
                  ].map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => setReadingAns(i)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                        readingAns === i ? "bg-[#EBF3FC] border-[#1A73E8] font-bold text-[#1D74B4]" : "bg-white border-[#E9E9E7] hover:bg-[#FAFAF9]"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <span></span>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 bg-[#37352F] hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  Save & Proceed <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LISTENING SECTION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-[#FAFAF9] border border-[#E9E9E7] p-5 rounded-lg space-y-4">
                <h4 className="font-bold text-[#37352F] text-xs uppercase tracking-wider">Compréhension Orale (Listening feedback simulation)</h4>
                <div className="p-3 bg-white border border-[#E9E9E7] rounded-lg flex items-center justify-between">
                  <span className="text-xs text-[#37352F] font-bold">🔊 Audio Transmit Feed #232</span>
                  <span className="text-[10px] text-[#7A7A78]">Playback simulated active</span>
                </div>
                <p className="text-xs text-[#5F5E5B] italic leading-relaxed">"Bonjour, c'est Alain de la réception technique. Je vous contacte au sujet du dysfonctionnement du système de climatisation..."</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#7A7A78] uppercase">Question 2: Que réclame l'ingénieur à l'auditeur ?</p>
                  {[
                    "A) De lui louer un système de ventilation portatif.",
                    "B) De dégager la porte d'accès au boîtier ou compteur principal.",
                    "C) D'envoyer un chèque de caution.",
                    "D) De fermer les volets du bureau."
                  ].map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => setListeningAns(i)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                        listeningAns === i ? "bg-[#EBF3FC] border-[#1A73E8] font-bold text-[#1D74B4]" : "bg-white border-[#E9E9E7] hover:bg-[#FAFAF9]"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-1.5 border border-[#E9E9E7] text-[#5F5E5B] hover:text-[#37352F] hover:bg-[#F1F1EF] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous Section
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 bg-[#37352F] hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  Save & Proceed <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WRITING PROMPT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-[#FAFAF9] border border-[#E9E9E7] p-5 rounded-lg space-y-3">
                <h4 className="font-bold text-[#37352F] text-xs uppercase tracking-wider">Expression Écrite (Task argument essay)</h4>
                <p className="text-xs text-[#5F5E5B] leading-relaxed">
                  <strong>Sujet :</strong> Rédigez un court courrier des lecteurs s'opposant gentiment au bannissement radical des automobiles urbaines au profit de pistes cyclables. Proposez des mesures combinatoires. (200 mots requis).
                </p>

                <textarea
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  placeholder="Écrivez votre argumentation en français ici..."
                  rows={6}
                  className="w-full text-xs p-3.5 outline-none border border-[#E9E9E7] rounded-lg bg-white text-[#37352F] font-mono leading-relaxed focus:border-[#1A73E8]"
                ></textarea>
                <p className="text-[10px] text-right text-[#7A7A78] font-mono">Word Count: {writingText.split(/\s+/).filter(Boolean).length} / 200</p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3.5 py-1.5 border border-[#E9E9E7] text-[#5F5E5B] hover:text-[#37352F] hover:bg-[#F1F1EF] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous Section
                </button>
                <button
                  onClick={handleFinishExam}
                  className="px-4 py-2 bg-[#2D6A53] hover:bg-[#204E3C] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  Submit Simulation Exam
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINISHED OVERVIEW PANEL */}
          {currentStep === 4 && (
            <div className="text-center py-6 space-y-5 animate-fade-in text-[#37352F]">
              <div className="w-12 h-12 bg-[#EAF5F1] text-[#2D6A53] border border-[#D1EBE1] rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Academic Simulation Registered!</h4>
              <p className="text-xs text-[#7A7A78] max-w-sm mx-auto leading-relaxed">
                Congratulations on completing this diagnostic model. Your results have been compiled in your diagnostic trends workspace database.
              </p>

              <div className="border border-[#E9E9E7] rounded-xl p-4 max-w-xs mx-auto bg-[#FAFAF9]">
                <p className="text-[10px] uppercase font-bold text-[#7A7A78] tracking-wider mb-2">Score Matrix Evaluation</p>
                <div className="flex justify-around items-center pt-1">
                  <div>
                    <p className="text-[10px] text-[#7A7A78]">Comprehension</p>
                    <p className="text-base font-extrabold text-[#2D6A53]">
                      {((readingAns === 1 ? 1 : 0) + (listeningAns === 1 ? 1 : 0)) * 50}%
                    </p>
                  </div>
                  <div className="h-6 w-[1px] bg-[#E9E9E7]" />
                  <div>
                    <p className="text-[10px] text-[#7A7A78]">CEFR Rating</p>
                    <p className="text-base font-extrabold text-[#2D6A53]">
                      {((readingAns === 1 ? 1 : 0) + (listeningAns === 1 ? 1 : 0)) === 2 ? "C1" : "B2"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveSessionExam(null)}
                  className="px-4 py-2 bg-[#37352F] hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Back to Simulations Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
