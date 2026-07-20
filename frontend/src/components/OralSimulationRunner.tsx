import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import ModuleSessionShell from "./tcf/ModuleSessionShell";
import SpeakingPrecheckModal from "./SpeakingPrecheckModal";
import SpeakingConversationPanel, {
  type CandidateState,
} from "./SpeakingConversationPanel";
import SpeakingTaskProgress from "./SpeakingTaskProgress";
import AiEvaluatingModal from "./AiEvaluatingModal";
import { useExaminerTts } from "../hooks/useExaminerTts";
import { useSpeakingRecorder } from "../hooks/useSpeakingRecorder";
import { evaluateSpeakingModule } from "../api";
import { submitSpeakingTurn } from "../lib/apiClient";
import {
  ConversationTurn,
  ExamPathway,
  OralModuleResult,
  TcfExpressionSection,
} from "../types";

export interface OralSectionMeta {
  id: string;
  label: string;
  durationMinutes: number;
}

interface OralSimulationRunnerProps {
  title: string;
  objective: string;
  durationMinutes: number;
  sectionMetas: OralSectionMeta[];
  sectionIds: string[];
  sectionContent: Record<string, TcfExpressionSection>;
  examType: ExamPathway;
  exerciseId: string;
  onComplete: (
    result: OralModuleResult,
    options?: { pendingEval?: Promise<OralModuleResult> }
  ) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

interface SectionRecording {
  conversation: ConversationTurn[];
  userTurns: { blob: Blob; durationSeconds: number }[];
  prompt: string;
  stimulus?: string;
  durationSeconds: number;
  allocatedSeconds: number;
  secondsRemaining: number;
}

const TCF_TASK2_PREP_SECONDS = 120;
const TCF_TASK2_PREP_START_FR =
  "Votre temps de préparation de deux minutes commence maintenant.";
const MAX_TURN_RECORDING_SEC = 120;
/** Reject accidental taps / silence before calling Gemini. */
const MIN_TURN_RECORDING_SEC = 2;
/** Peak meter level (0–100) below this is treated as no speech. */
const MIN_PEAK_AUDIO_LEVEL = 8;
const NO_AUDIO_DETECTED_MESSAGE =
  "No Audio has been detected, Please record your reply again.";

function isNoSpeechError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("no clear speech") ||
    lower.includes("no speech") ||
    lower.includes("no audio")
  );
}

function buildEvalPrompt(content: TcfExpressionSection): string {
  if (content.stimulus) {
    return `Examiner cue: ${content.stimulus}\n\nTask instructions: ${content.prompt}`;
  }
  return content.prompt;
}

function examinerSpokenText(content: TcfExpressionSection): string {
  return content.stimulus?.trim() || content.prompt;
}

export default function OralSimulationRunner({
  title,
  objective,
  durationMinutes,
  sectionMetas,
  sectionIds,
  sectionContent,
  examType,
  exerciseId,
  onComplete,
  onAbort,
  examMode = true,
}: OralSimulationRunnerProps) {
  const [precheckDone, setPrecheckDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    sectionMetas[0].durationMinutes * 60
  );
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number | null>(null);
  const [examinerReady, setExaminerReady] = useState(false);
  /** TCF Task 2 only: Respond stays locked until the prep countdown finishes. */
  const [task2PrepDone, setTask2PrepDone] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [processingTurn, setProcessingTurn] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [userTurnAudios, setUserTurnAudios] = useState<
    { blob: Blob; durationSeconds: number }[]
  >([]);
  const [completedSections, setCompletedSections] = useState<
    Record<string, SectionRecording>
  >({});

  const examinerSpokeRef = useRef(false);
  const prepWasActiveRef = useRef(false);
  const stopRecordingRef = useRef<() => Promise<void>>(async () => {});
  const { speak, cancel, isSpeaking, hasFrenchVoice } = useExaminerTts();

  const sectionId = sectionIds[currentIndex];
  const meta = sectionMetas[currentIndex];
  const content = sectionContent[sectionId];
  const isTcfTask2 = examType === "TCF" && sectionId === "2";
  const isTcfTask2Prep = isTcfTask2 && prepSecondsLeft != null;

  const recorder = useSpeakingRecorder({
    maxSeconds: MAX_TURN_RECORDING_SEC,
    onMaxDuration: () => {
      void stopRecordingRef.current();
    },
  });
  const { reset: resetRecorder } = recorder;

  const userTurnCount = conversation.filter((t) => t.role === "user").length;
  const sectionSubmitted = Boolean(completedSections[sectionId]);

  const candidateState: CandidateState = processingTurn
    ? "processing"
    : recorder.isRecording
      ? "listening"
      : "idle";

  const resetSectionState = useCallback(() => {
    setConversation([]);
    setUserTurnAudios([]);
    setExaminerReady(false);
    setTask2PrepDone(false);
    setProcessingTurn(false);
    setTimerExpired(false);
    setConversationError(null);
    examinerSpokeRef.current = false;
    prepWasActiveRef.current = false;
    resetRecorder();
  }, [resetRecorder]);

  useEffect(() => {
    setSecondsLeft(meta.durationMinutes * 60);
    resetSectionState();
    // Task 2 prep starts only after the examiner finishes reciting (see speak onEnd).
    setPrepSecondsLeft(null);
  }, [currentIndex, meta.durationMinutes, sectionId, examType, resetSectionState]);

  // Always show the examiner cue in the conversation pane (needed during Task 2 prep).
  useEffect(() => {
    if (!precheckDone || sectionSubmitted) return;
    if (conversation.length > 0) return;

    const opening = examinerSpokenText(content);
    if (!opening.trim()) return;
    setConversation([{ role: "examiner", text: opening }]);
  }, [
    precheckDone,
    sectionSubmitted,
    content,
    conversation.length,
    currentIndex,
  ]);

  // Recite the opening cue. For TCF Task 2, announce prep in French, then start the timer.
  useEffect(() => {
    if (!precheckDone || sectionSubmitted) return;
    if (examinerSpokeRef.current) return;
    if (prepSecondsLeft != null) return;

    const opening = examinerSpokenText(content);
    const startPrepAfterAnnouncement = () => {
      setConversation((prev) => {
        const alreadyAnnounced = prev.some(
          (t) => t.role === "examiner" && t.text === TCF_TASK2_PREP_START_FR
        );
        if (alreadyAnnounced) return prev;
        return [...prev, { role: "examiner", text: TCF_TASK2_PREP_START_FR }];
      });
      speak(TCF_TASK2_PREP_START_FR, () => {
        setPrepSecondsLeft(TCF_TASK2_PREP_SECONDS);
      });
    };

    if (!opening.trim()) {
      examinerSpokeRef.current = true;
      if (isTcfTask2) {
        startPrepAfterAnnouncement();
      } else {
        setExaminerReady(true);
      }
      return;
    }

    examinerSpokeRef.current = true;
    speak(opening, () => {
      if (isTcfTask2) {
        startPrepAfterAnnouncement();
      } else {
        setExaminerReady(true);
      }
    });
  }, [
    precheckDone,
    prepSecondsLeft,
    content,
    speak,
    sectionSubmitted,
    isTcfTask2,
  ]);

  useEffect(() => {
    if (prepSecondsLeft == null || prepSecondsLeft <= 0) return;
    prepWasActiveRef.current = true;
    const t = setInterval(() => {
      setPrepSecondsLeft((s) => {
        if (s == null || s <= 1) return null;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [prepSecondsLeft]);

  // After Task 2 prep finishes, unlock Respond (opening was already recited).
  useEffect(() => {
    if (!isTcfTask2 || !precheckDone || sectionSubmitted) return;
    if (prepSecondsLeft != null || !prepWasActiveRef.current) return;
    prepWasActiveRef.current = false;
    setTask2PrepDone(true);
    setExaminerReady(true);
  }, [prepSecondsLeft, isTcfTask2, precheckDone, sectionSubmitted]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setTimerExpired(true);
      // If the candidate is mid-reply, let them finish and tap stop;
      // that stop path submits the section without an examiner follow-up.
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const handleRespond = useCallback(async () => {
    if (timerExpired || sectionSubmitted) return;
    // TCF Task 2: block Respond until prep countdown has fully finished.
    if (isTcfTask2 && (!task2PrepDone || prepSecondsLeft != null)) return;
    setError(null);
    setConversationError(null);
    await recorder.startRecording();
  }, [
    recorder,
    sectionSubmitted,
    timerExpired,
    isTcfTask2,
    task2PrepDone,
    prepSecondsLeft,
  ]);

  const completeCurrentSection = useCallback(
    (overrides?: {
      conversation?: ConversationTurn[];
      userTurns?: { blob: Blob; durationSeconds: number }[];
      secondsRemaining?: number;
    }) => {
      const finalConversation = overrides?.conversation ?? conversation;
      const finalUserTurns = overrides?.userTurns ?? userTurnAudios;
      const finalSecondsRemaining = overrides?.secondsRemaining ?? secondsLeft;
      const totalDuration = finalUserTurns.reduce(
        (sum, t) => sum + t.durationSeconds,
        0
      );
      setCompletedSections((prev) => ({
        ...prev,
        [sectionId]: {
          conversation: [...finalConversation],
          userTurns: [...finalUserTurns],
          prompt: buildEvalPrompt(content),
          stimulus: content.stimulus,
          durationSeconds: totalDuration,
          allocatedSeconds: meta.durationMinutes * 60,
          secondsRemaining: finalSecondsRemaining,
        },
      }));
    },
    [
      userTurnAudios,
      conversation,
      sectionId,
      content,
      meta.durationMinutes,
      secondsLeft,
    ]
  );

  const handleStopRecording = useCallback(async () => {
    if (sectionSubmitted) return;
    const result = await recorder.stopRecording();
    if (!result) return;

    // Time already up while speaking: keep this reply, skip examiner follow-up,
    // and submit the section as soon as they tap stop.
    if (timerExpired) {
      const keepClip = result.durationSeconds >= 1;
      const nextAudios = keepClip
        ? [
            ...userTurnAudios,
            { blob: result.blob, durationSeconds: result.durationSeconds },
          ]
        : userTurnAudios;
      const nextConversation = keepClip
        ? [
            ...conversation,
            {
              role: "user" as const,
              text: "[Réponse enregistrée - temps écoulé]",
            },
          ]
        : conversation;

      if (nextAudios.length === 0 && nextConversation.filter((t) => t.role === "user").length === 0) {
        setConversationError(null);
        setError("Time is up, no reply was captured for this section.");
        setExaminerReady(true);
        return;
      }

      setUserTurnAudios(nextAudios);
      setConversation(nextConversation);
      setError(null);
      setConversationError(null);
      cancel();
      completeCurrentSection({
        conversation: nextConversation,
        userTurns: nextAudios,
        secondsRemaining: 0,
      });
      return;
    }

    if (result.durationSeconds < MIN_TURN_RECORDING_SEC) {
      setConversationError(null);
      setError("Speak for at least 2 seconds, then stop recording.");
      setExaminerReady(true);
      return;
    }
    if (result.peakAudioLevel < MIN_PEAK_AUDIO_LEVEL) {
      setError(null);
      setConversationError(NO_AUDIO_DETECTED_MESSAGE);
      setExaminerReady(true);
      return;
    }

    setProcessingTurn(true);
    setError(null);
    setConversationError(null);

    try {
      const history = conversation;
      const response = await submitSpeakingTurn(result.blob, {
        exam_type: examType,
        section_id: sectionId,
        prompt: buildEvalPrompt(content),
        stimulus: content.stimulus,
        history,
      });

      setUserTurnAudios((prev) => [
        ...prev,
        { blob: result.blob, durationSeconds: result.durationSeconds },
      ]);
      setConversation((prev) => [
        ...prev,
        { role: "user", text: response.user_transcript },
        { role: "examiner", text: response.examiner_reply },
      ]);

      speak(response.examiner_reply, () => setExaminerReady(true));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not process your response. Please try again.";
      if (isNoSpeechError(message)) {
        setError(null);
        setConversationError(NO_AUDIO_DETECTED_MESSAGE);
      } else {
        setConversationError(null);
        setError(message);
      }
      setExaminerReady(true);
    } finally {
      setProcessingTurn(false);
    }
  }, [
    recorder,
    conversation,
    examType,
    sectionId,
    content,
    speak,
    sectionSubmitted,
    timerExpired,
    userTurnAudios,
    cancel,
    completeCurrentSection,
  ]);

  stopRecordingRef.current = handleStopRecording;

  const handleReplayTurn = useCallback(
    (index: number) => {
      const turn = conversation[index];
      if (!turn || turn.role !== "examiner") return;
      speak(turn.text, () => setExaminerReady(true));
    },
    [conversation, speak]
  );

  const handleSubmitSection = useCallback(() => {
    if (userTurnCount < 1 || sectionSubmitted) return;
    cancel();
    completeCurrentSection();
  }, [userTurnCount, sectionSubmitted, completeCurrentSection, cancel]);

  const allSectionsComplete = sectionIds.every((id) => completedSections[id]);
  const isLastTask = currentIndex === sectionIds.length - 1;

  const buildEvalSections = useCallback(
    () =>
      sectionIds.map((id) => {
        const section = completedSections[id];
        return {
          section_id: id,
          prompt: section.prompt,
          stimulus: section.stimulus,
          conversation: section.conversation,
          user_turns: section.userTurns.map((t) => ({
            blob: t.blob,
            duration_seconds: t.durationSeconds,
          })),
          duration_seconds: section.durationSeconds,
          allocated_seconds: section.allocatedSeconds,
          seconds_remaining: section.secondsRemaining,
        };
      }),
    [sectionIds, completedSections]
  );

  const buildDraftResult = useCallback(
    (): OralModuleResult => ({
      sections: sectionIds.map((id) => {
        const section = completedSections[id];
        const userTranscript = section.conversation
          .filter((t) => t.role === "user")
          .map((t) => t.text)
          .join(" ");
        return {
          sectionId: id,
          transcript: userTranscript,
          durationSeconds: section.durationSeconds,
          examinerCue: section.conversation.find((t) => t.role === "examiner")?.text,
          conversation: section.conversation,
        };
      }),
    }),
    [sectionIds, completedSections]
  );

  const submitModule = useCallback(async () => {
    setError(null);
    const sections = buildEvalSections();

    if (examMode) {
      const draft = buildDraftResult();
      const pendingEval = evaluateSpeakingModule(
        "expression-orale",
        examType,
        exerciseId,
        sections,
        "mock"
      ).then((results) => ({ sections: results }));
      onComplete(draft, { pendingEval });
      return;
    }

    setEvaluating(true);
    try {
      const results = await evaluateSpeakingModule(
        "expression-orale",
        examType,
        exerciseId,
        sections,
        "practice"
      );
      onComplete({ sections: results });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Speaking evaluation failed. Please try again."
      );
    } finally {
      setEvaluating(false);
    }
  }, [
    buildEvalSections,
    buildDraftResult,
    examType,
    exerciseId,
    examMode,
    onComplete,
  ]);

  const advanceOrSubmit = useCallback(async () => {
    if (!completedSections[sectionId]) return;
    if (isLastTask) {
      await submitModule();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [completedSections, sectionId, isLastTask, submitModule]);

  const footer = (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="text-xs text-[#B83E5C] bg-[#FCECF0] border border-[#F8D4DE] rounded-lg px-3 py-2 w-full">
          {error}
        </p>
      )}
      {timerExpired && !sectionSubmitted && recorder.isRecording && (
        <p className="text-xs text-[#5F5E5B] w-full">
          Time is up - tap stop when you finish speaking to submit this section.
        </p>
      )}
      {timerExpired && !sectionSubmitted && !recorder.isRecording && userTurnCount > 0 && (
        <p className="text-xs text-[#5F5E5B] w-full">
          Time is up - submit this section to continue.
        </p>
      )}
      <button
        type="button"
        disabled={
          (!examMode && evaluating) ||
          !completedSections[sectionId] ||
          (isLastTask && !allSectionsComplete)
        }
        onClick={() => void advanceOrSubmit()}
        className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer ${
          isLastTask ? "bg-[#2D6A53]" : "bg-[#37352F]"
        }`}
      >
        {!examMode && evaluating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isLastTask ? (
          <>
            <Sparkles className="w-3.5 h-3.5" /> Submit for evaluation
          </>
        ) : (
          <>
            Next task <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );

  if (!precheckDone) {
    return (
      <SpeakingPrecheckModal
        open
        estimatedMinutes={durationMinutes}
        onCancel={() => onAbort?.()}
        onConfirm={() => setPrecheckDone(true)}
      />
    );
  }

  const taskLabels = sectionMetas.map((s) => s.label.split(":")[0].trim());
  const canRespond =
    examinerReady &&
    (!isTcfTask2 || task2PrepDone) &&
    !isTcfTask2Prep &&
    !isSpeaking &&
    !recorder.isRecording &&
    !processingTurn &&
    !sectionSubmitted &&
    !timerExpired &&
    secondsLeft > 0;

  return (
    <>
      <AiEvaluatingModal open={!examMode && evaluating} />

      <ModuleSessionShell
        title={title}
        objective={objective}
        secondsRemaining={secondsLeft}
        progressLabel={`Task ${currentIndex + 1}/${sectionIds.length}`}
        onAbort={onAbort}
        footer={footer}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#37352F]">{meta.label}</p>

            {isTcfTask2Prep && (
              <div className="bg-[#FEF9E7] border border-[#F5E6A8] rounded-lg px-4 py-3 text-xs text-[#37352F]">
                <span className="font-bold">Preparation time: </span>
                {prepSecondsLeft}s remaining - review the scenario and prepare your
                answers. Respond when preparation ends.
              </div>
            )}

            {!examMode && (
              <p className="text-sm font-semibold text-[#37352F] leading-relaxed">{content.prompt}</p>
            )}

            <SpeakingConversationPanel
              turns={conversation}
              isExaminerSpeaking={isSpeaking}
              isProcessingTurn={processingTurn}
              candidateState={candidateState}
              recordingSeconds={recorder.recordingSeconds}
              audioLevel={recorder.audioLevel}
              onRespond={() => void handleRespond()}
              onStopRecording={() => void handleStopRecording()}
              onReplayTurn={handleReplayTurn}
              onSubmitSection={handleSubmitSection}
              canRespond={canRespond}
              canSubmitSection={
                userTurnCount >= 1 &&
                !sectionSubmitted &&
                !recorder.isRecording &&
                !processingTurn
              }
              voiceUnavailable={!hasFrenchVoice}
              conversationError={conversationError}
            />

            {sectionSubmitted && (
              <p className="text-xs text-[#2D6A53] font-medium text-center">
                Section submitted - use Next task below to continue.
              </p>
            )}
          </div>

          <SpeakingTaskProgress
            taskLabels={taskLabels}
            currentIndex={currentIndex}
            precheckDone={precheckDone}
            sectionSecondsLeft={secondsLeft}
          />
        </div>
      </ModuleSessionShell>
    </>
  );
}
