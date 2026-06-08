import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import ModuleSessionShell from "../tcf/ModuleSessionShell";
import SpeakingPrecheckModal from "../SpeakingPrecheckModal";
import { evaluateSpeaking } from "../../api";
import {
  TefModuleDefinition,
  OralModuleResult,
} from "../../types";

interface TefOralModuleRunnerProps {
  module: TefModuleDefinition;
  onComplete: (result: OralModuleResult) => void;
  onAbort?: () => void;
  examMode?: boolean;
}

export default function TefOralModuleRunner({
  module,
  onComplete,
  onAbort,
  examMode = true,
}: TefOralModuleRunnerProps) {
  const sections = module.meta.sections!;
  const sectionA = module.sections!["A"];
  const sectionB = module.sections!["B"];
  const metaA = sections.find((s) => s.id === "A")!;
  const metaB = sections.find((s) => s.id === "B")!;

  const [currentSection, setCurrentSection] = useState<"A" | "B">("A");
  const [transcriptA, setTranscriptA] = useState("");
  const [transcriptB, setTranscriptB] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(metaA.durationMinutes * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState<OralModuleResult["sections"][0] | null>(null);
  const [precheckDone, setPrecheckDone] = useState(false);

  const activeMeta = currentSection === "A" ? metaA : metaB;
  const activeContent = currentSection === "A" ? sectionA : sectionB;
  const activeTranscript = currentSection === "A" ? transcriptA : transcriptB;
  const setActiveTranscript = currentSection === "A" ? setTranscriptA : setTranscriptB;
  const maxRecordingSec = activeMeta.durationMinutes * 60;

  useEffect(() => {
    setSecondsLeft(activeMeta.durationMinutes * 60);
    setIsRecording(false);
    setRecordingSeconds(0);
  }, [currentSection, activeMeta.durationMinutes]);

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

  const submitSectionA = useCallback(async () => {
    if (!transcriptA.trim()) return;
    setLoading(true);
    try {
      const feedback = await evaluateSpeaking(
        sectionA.prompt,
        transcriptA,
        0,
        recordingSeconds || metaA.durationMinutes * 60,
        "TEF",
        "A"
      );
      setResultA({
        sectionId: "A",
        transcript: transcriptA,
        durationSeconds: recordingSeconds,
        feedback,
      });
      setCurrentSection("B");
    } finally {
      setLoading(false);
    }
  }, [
    transcriptA,
    recordingSeconds,
    metaA.durationMinutes,
    sectionA.prompt,
  ]);

  const finishModule = useCallback(async () => {
    if (!transcriptB.trim()) return;
    setLoading(true);
    try {
      const feedbackB = await evaluateSpeaking(
        sectionB.prompt,
        transcriptB,
        0,
        recordingSeconds || metaB.durationMinutes * 60,
        "TEF",
        "B"
      );
      const sectionsOut: OralModuleResult["sections"] = [
        resultA ?? {
          sectionId: "A",
          transcript: transcriptA,
          durationSeconds: 0,
        },
        {
          sectionId: "B",
          transcript: transcriptB,
          durationSeconds: recordingSeconds,
          feedback: feedbackB,
        },
      ];
      if (!resultA && transcriptA.trim()) {
        const feedbackA = await evaluateSpeaking(
          sectionA.prompt,
          transcriptA,
          0,
          metaA.durationMinutes * 60,
          "TEF",
          "A"
        );
        sectionsOut[0] = {
          sectionId: "A",
          transcript: transcriptA,
          durationSeconds: metaA.durationMinutes * 60,
          feedback: feedbackA,
        };
      }
      onComplete({ sections: sectionsOut });
    } finally {
      setLoading(false);
    }
  }, [
    transcriptB,
    recordingSeconds,
    metaB.durationMinutes,
    sectionB.prompt,
    resultA,
    transcriptA,
    sectionA.prompt,
    metaA.durationMinutes,
    onComplete,
  ]);

  const footer = (
    <div className="flex justify-end">
      {currentSection === "A" ? (
        <button
          type="button"
          disabled={loading || !transcriptA.trim()}
          onClick={submitSectionA}
          className="px-4 py-2 bg-[#37352F] text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Complete Section A <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          disabled={loading || !transcriptB.trim()}
          onClick={finishModule}
          className="px-4 py-2 bg-[#2D6A53] text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Submit module
            </>
          )}
        </button>
      )}
    </div>
  );

  if (!precheckDone) {
    return (
      <SpeakingPrecheckModal
        open
        estimatedMinutes={module.meta.durationMinutes}
        onCancel={() => onAbort?.()}
        onConfirm={() => setPrecheckDone(true)}
      />
    );
  }

  return (
    <ModuleSessionShell
      title={`TEF · ${module.meta.labelFr}`}
      objective={module.meta.objective}
      secondsRemaining={secondsLeft}
      currentSection={currentSection}
      sectionLabels={{
        A: `A · ${metaA.durationMinutes} min`,
        B: `B · ${metaB.durationMinutes} min`,
      }}
      onAbort={onAbort}
      footer={footer}
    >
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#37352F]">{activeMeta.label}</p>
        {activeContent.stimulus && (
          <div className="bg-[#FAFAF9] border border-[#E9E9E7] rounded-lg p-3 text-xs">
            {activeContent.stimulus}
          </div>
        )}
        <p className="text-xs text-[#5F5E5B]">{activeContent.prompt}</p>

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
              Start recording ({activeMeta.durationMinutes} min max)
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
          onChange={(e) => setActiveTranscript(e.target.value)}
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
