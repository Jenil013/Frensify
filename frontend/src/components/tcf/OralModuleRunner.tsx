import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import ModuleSessionShell from "./ModuleSessionShell";
import { evaluateSpeaking } from "../../api";
import {
  ExamPathway,
  OralModuleResult,
  OralSectionResult,
  TcfModuleDefinition,
} from "../../types";

interface OralModuleRunnerProps {
  module: TcfModuleDefinition;
  examType: ExamPathway;
  onComplete: (result: OralModuleResult) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

const TASK_IDS = ["1", "2", "3"] as const;

export default function OralModuleRunner({
  module,
  examType,
  onComplete,
  onAbort,
  examMode = true,
}: OralModuleRunnerProps) {
  const sectionsMeta = module.meta.sections!;
  const sectionContent = module.sections!;

  const [currentTask, setCurrentTask] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>(["", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(
    sectionsMeta[0].durationMinutes * 60
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedResults, setCompletedResults] = useState<OralSectionResult[]>([]);

  const taskId = TASK_IDS[currentTask];
  const meta = sectionsMeta[currentTask];
  const content = sectionContent[taskId];
  const activeTranscript = transcripts[currentTask];
  const maxRecordingSec = meta.durationMinutes * 60;

  useEffect(() => {
    setSecondsLeft(sectionsMeta[currentTask].durationMinutes * 60);
    setIsRecording(false);
    setRecordingSeconds(0);
  }, [currentTask, sectionsMeta]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => {
      setRecordingSeconds((s) => {
        if (s >= maxRecordingSec - 1) {
          setIsRecording(false);
          return maxRecordingSec;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRecording, maxRecordingSec]);

  const updateTranscript = (value: string) => {
    setTranscripts((prev) => {
      const next = [...prev];
      next[currentTask] = value;
      return next;
    });
  };

  const submitCurrentTask = useCallback(async () => {
    if (!activeTranscript.trim()) return;
    setLoading(true);
    try {
      const feedback = await evaluateSpeaking(
        content.prompt,
        activeTranscript,
        0,
        recordingSeconds || meta.durationMinutes * 60,
        examType,
        taskId
      );
      const sectionResult: OralSectionResult = {
        sectionId: taskId,
        transcript: activeTranscript,
        durationSeconds: recordingSeconds,
        feedback,
      };
      const nextResults = [...completedResults, sectionResult];
      setCompletedResults(nextResults);

      if (currentTask < 2) {
        setCurrentTask((t) => t + 1);
      } else {
        onComplete({ sections: nextResults });
      }
    } finally {
      setLoading(false);
    }
  }, [
    activeTranscript,
    content.prompt,
    recordingSeconds,
    meta.durationMinutes,
    examType,
    taskId,
    completedResults,
    currentTask,
    onComplete,
  ]);

  const isLastTask = currentTask === 2;

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        disabled={loading || !activeTranscript.trim()}
        onClick={submitCurrentTask}
        className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer ${
          isLastTask ? "bg-[#2D6A53]" : "bg-[#37352F]"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isLastTask ? (
          <>
            <Sparkles className="w-3.5 h-3.5" /> Submit module
          </>
        ) : (
          <>
            Complete Task {currentTask + 1} <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );

  return (
    <ModuleSessionShell
      title={module.meta.labelFr}
      objective={module.meta.objective}
      secondsRemaining={secondsLeft}
      progressLabel={`Task ${currentTask + 1}/3`}
      onAbort={onAbort}
      footer={footer}
    >
      <div className="space-y-3">
        <div className="flex gap-1 p-1 bg-[#F1F1EF] border border-[#E9E9E7] rounded-lg">
          {TASK_IDS.map((id, idx) => (
            <div
              key={id}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs text-center ${
                idx === currentTask
                  ? "bg-white font-bold border border-[#E9E9E7] shadow-sm text-[#37352F]"
                  : idx < currentTask
                  ? "text-[#2D6A53] font-medium"
                  : "text-[#7B7B79]"
              }`}
            >
              {sectionsMeta[idx].label.split("—")[0].trim()}
            </div>
          ))}
        </div>

        <p className="text-xs font-bold text-[#37352F]">{meta.label}</p>
        {content.stimulus && (
          <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3 text-xs">
            {content.stimulus}
          </div>
        )}
        <p className="text-xs text-[#5F5E5B]">{content.prompt}</p>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={() => {
                setRecordingSeconds(0);
                setIsRecording(true);
              }}
              className="px-3 py-1.5 bg-[#FCECF0] border border-[#F8D4DE] text-[#B83E5C] text-xs font-bold rounded-lg cursor-pointer"
            >
              Start recording ({meta.durationMinutes} min max)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecording(false)}
              className="px-3 py-1.5 bg-[#B83E5C] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Stop · {recordingSeconds}s
            </button>
          )}
        </div>

        <textarea
          value={activeTranscript}
          onChange={(e) => updateTranscript(e.target.value)}
          rows={5}
          placeholder={
            examMode
              ? "Paste or type your spoken response transcript for AI evaluation..."
              : "Transcript..."
          }
          className="w-full text-xs p-3 border border-[#E9E9E7] rounded-lg outline-none font-mono"
        />
      </div>
    </ModuleSessionShell>
  );
}
