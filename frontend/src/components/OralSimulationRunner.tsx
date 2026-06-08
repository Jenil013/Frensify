import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import ModuleSessionShell from "./tcf/ModuleSessionShell";
import SpeakingPrecheckModal from "./SpeakingPrecheckModal";
import SpeakingConversationPanel, {
  type CandidateState,
} from "./SpeakingConversationPanel";
import SpeakingTaskProgress from "./SpeakingTaskProgress";
import { useExaminerTts } from "../hooks/useExaminerTts";
import { useSpeakingRecorder } from "../hooks/useSpeakingRecorder";
import { evaluateSpeakingModule } from "../api";
import {
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
  onComplete: (result: OralModuleResult) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

const TCF_TASK2_PREP_SECONDS = 60;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<
    Record<string, { blob: Blob; durationSeconds: number }>
  >({});

  const examinerSpokeRef = useRef(false);
  const stopRecordingRef = useRef<() => Promise<void>>(async () => {});
  const { speak, cancel, isSpeaking, hasFrenchVoice } = useExaminerTts();

  const sectionId = sectionIds[currentIndex];
  const meta = sectionMetas[currentIndex];
  const content = sectionContent[sectionId];
  const maxRecordingSec = meta.durationMinutes * 60;
  const isTcfTask2Prep =
    examType === "TCF" && sectionId === "2" && prepSecondsLeft != null;

  const recorder = useSpeakingRecorder({
    maxSeconds: maxRecordingSec,
    onMaxDuration: () => {
      void stopRecordingRef.current();
    },
  });
  const { reset: resetRecorder } = recorder;

  const taskRecording = recordings[sectionId];
  const candidateState: CandidateState = recorder.isRecording
    ? "listening"
    : taskRecording
      ? "recorded"
      : "idle";

  useEffect(() => {
    setSecondsLeft(meta.durationMinutes * 60);
    setExaminerReady(false);
    examinerSpokeRef.current = false;
    resetRecorder();

    if (examType === "TCF" && sectionId === "2") {
      setPrepSecondsLeft(TCF_TASK2_PREP_SECONDS);
    } else {
      setPrepSecondsLeft(null);
    }
  }, [currentIndex, meta.durationMinutes, sectionId, examType, resetRecorder]);

  useEffect(() => {
    if (!precheckDone || prepSecondsLeft != null) return;
    if (examinerSpokeRef.current) return;

    examinerSpokeRef.current = true;
    const text = examinerSpokenText(content);
    speak(text, () => setExaminerReady(true));
  }, [precheckDone, prepSecondsLeft, content, speak]);

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
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const handleRespond = useCallback(async () => {
    setError(null);
    await recorder.startRecording();
  }, [recorder]);

  const handleStopRecording = useCallback(async () => {
    const result = await recorder.stopRecording();
    if (result) {
      setRecordings((prev) => ({
        ...prev,
        [sectionId]: {
          blob: result.blob,
          durationSeconds: result.durationSeconds,
        },
      }));
    }
  }, [recorder, sectionId]);

  stopRecordingRef.current = handleStopRecording;

  const handleReplayExaminer = useCallback(() => {
    speak(examinerSpokenText(content), () => setExaminerReady(true));
  }, [content, speak]);

  const allRecorded = sectionIds.every((id) => recordings[id]);
  const isLastTask = currentIndex === sectionIds.length - 1;

  const submitModule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sections = sectionIds.map((id) => ({
        section_id: id,
        prompt: buildEvalPrompt(sectionContent[id]),
        blob: recordings[id].blob,
        duration_seconds: recordings[id].durationSeconds,
      }));
      const results = await evaluateSpeakingModule(
        "expression-orale",
        examType,
        exerciseId,
        sections,
        examMode ? "mock" : "practice"
      );
      onComplete({ sections: results });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Speaking evaluation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    sectionIds,
    sectionContent,
    recordings,
    examType,
    exerciseId,
    examMode,
    onComplete,
  ]);

  const advanceOrSubmit = useCallback(async () => {
    if (!taskRecording) return;
    if (isLastTask) {
      await submitModule();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [taskRecording, isLastTask, submitModule]);

  const footer = (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="text-xs text-[#B83E5C] bg-[#FCECF0] border border-[#F8D4DE] rounded-lg px-3 py-2 w-full">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={loading || !taskRecording || (isLastTask && !allRecorded)}
        onClick={() => void advanceOrSubmit()}
        className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer ${
          isLastTask ? "bg-[#2D6A53]" : "bg-[#37352F]"
        }`}
      >
        {loading ? (
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

  return (
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
            examinerCue={examinerSpokenText(content)}
            isExaminerSpeaking={isSpeaking}
            candidateState={candidateState}
            recordingSeconds={
              recorder.isRecording
                ? recorder.recordingSeconds
                : taskRecording?.durationSeconds ?? 0
            }
            audioLevel={recorder.audioLevel}
            onRespond={() => void handleRespond()}
            onStopRecording={() => void handleStopRecording()}
            onReplayExaminer={handleReplayExaminer}
            canRespond={
              examinerReady && !isSpeaking && !recorder.isRecording && !taskRecording
            }
            voiceUnavailable={!hasFrenchVoice}
          />
        </div>

        <SpeakingTaskProgress
          taskLabels={taskLabels}
          currentIndex={currentIndex}
          precheckDone={precheckDone}
          sectionSecondsLeft={secondsLeft}
        />
      </div>
    </ModuleSessionShell>
  );
}
