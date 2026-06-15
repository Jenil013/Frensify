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

const TCF_TASK2_PREP_SECONDS = 60;
const MAX_TURN_RECORDING_SEC = 120;

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
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const stopRecordingRef = useRef<() => Promise<void>>(async () => {});
  const { speak, cancel, isSpeaking, hasFrenchVoice } = useExaminerTts();

  const sectionId = sectionIds[currentIndex];
  const meta = sectionMetas[currentIndex];
  const content = sectionContent[sectionId];
  const isTcfTask2Prep =
    examType === "TCF" && sectionId === "2" && prepSecondsLeft != null;

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
    setProcessingTurn(false);
    setTimerExpired(false);
    examinerSpokeRef.current = false;
    resetRecorder();
  }, [resetRecorder]);

  useEffect(() => {
    setSecondsLeft(meta.durationMinutes * 60);
    resetSectionState();

    if (examType === "TCF" && sectionId === "2") {
      setPrepSecondsLeft(TCF_TASK2_PREP_SECONDS);
    } else {
      setPrepSecondsLeft(null);
    }
  }, [currentIndex, meta.durationMinutes, sectionId, examType, resetSectionState]);

  useEffect(() => {
    if (!precheckDone || prepSecondsLeft != null || sectionSubmitted) return;
    if (examinerSpokeRef.current) return;
    if (conversation.length > 0) return;

    examinerSpokeRef.current = true;
    const opening = examinerSpokenText(content);
    setConversation([{ role: "examiner", text: opening }]);
    speak(opening, () => setExaminerReady(true));
  }, [
    precheckDone,
    prepSecondsLeft,
    content,
    speak,
    conversation.length,
    sectionSubmitted,
  ]);

  useEffect(() => {
    if (prepSecondsLeft == null || prepSecondsLeft <= 0) return;
    const t = setInterval(() => {
      setPrepSecondsLeft((s) => {
        if (s == null || s <= 1) return null;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [prepSecondsLeft]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setTimerExpired(true);
      if (recorder.isRecording) {
        void stopRecordingRef.current();
      }
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, recorder.isRecording]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const handleRespond = useCallback(async () => {
    if (timerExpired || sectionSubmitted) return;
    setError(null);
    await recorder.startRecording();
  }, [recorder, sectionSubmitted, timerExpired]);

  const handleStopRecording = useCallback(async () => {
    if (sectionSubmitted) return;
    const result = await recorder.stopRecording();
    if (!result) return;

    setProcessingTurn(true);
    setError(null);

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
      setError(
        err instanceof Error
          ? err.message
          : "Could not process your response. Please try again."
      );
      setExaminerReady(true);
    } finally {
      setProcessingTurn(false);
    }
  }, [recorder, conversation, examType, sectionId, content, speak, sectionSubmitted]);

  stopRecordingRef.current = handleStopRecording;

  const handleReplayTurn = useCallback(
    (index: number) => {
      const turn = conversation[index];
      if (!turn || turn.role !== "examiner") return;
      speak(turn.text, () => setExaminerReady(true));
    },
    [conversation, speak]
  );

  const completeCurrentSection = useCallback(() => {
    const totalDuration = userTurnAudios.reduce(
      (sum, t) => sum + t.durationSeconds,
      0
    );
    setCompletedSections((prev) => ({
      ...prev,
      [sectionId]: {
        conversation: [...conversation],
        userTurns: [...userTurnAudios],
        prompt: buildEvalPrompt(content),
        stimulus: content.stimulus,
        durationSeconds: totalDuration,
        allocatedSeconds: meta.durationMinutes * 60,
        secondsRemaining: secondsLeft,
      },
    }));
  }, [userTurnAudios, conversation, sectionId, content, meta.durationMinutes, secondsLeft]);

  const handleSubmitSection = useCallback(() => {
    if (userTurnCount < 1 || sectionSubmitted) return;
    completeCurrentSection();
  }, [userTurnCount, sectionSubmitted, completeCurrentSection]);

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
      {timerExpired && !sectionSubmitted && userTurnCount > 0 && (
        <p className="text-xs text-[#5F5E5B] w-full">
          Time is up — submit this section to continue.
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

  const taskLabels = sectionMetas.map((s) => s.label.split("—")[0].trim());
  const canRespond =
    examinerReady &&
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
                {prepSecondsLeft}s remaining — read the scenario, then the examiner
                will speak.
              </div>
            )}

            {!examMode && (
              <p className="text-xs text-[#5F5E5B] leading-relaxed">{content.prompt}</p>
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
            />

            {sectionSubmitted && (
              <p className="text-xs text-[#2D6A53] font-medium text-center">
                Section submitted — use Next task below to continue.
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
