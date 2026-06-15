import React, { useEffect, useRef } from "react";
import { Loader2, Mic, Volume2 } from "lucide-react";
import type { ConversationTurn } from "../types";

export type CandidateState = "idle" | "listening" | "processing";

interface SpeakingConversationPanelProps {
  turns: ConversationTurn[];
  isExaminerSpeaking: boolean;
  isProcessingTurn: boolean;
  candidateState: CandidateState;
  recordingSeconds: number;
  audioLevel: number;
  onRespond: () => void;
  onStopRecording: () => void;
  onReplayTurn: (index: number) => void;
  onSubmitSection: () => void;
  canRespond: boolean;
  canSubmitSection: boolean;
  voiceUnavailable?: boolean;
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SpeakingConversationPanel({
  turns,
  isExaminerSpeaking,
  isProcessingTurn,
  candidateState,
  recordingSeconds,
  audioLevel,
  onRespond,
  onStopRecording,
  onReplayTurn,
  onSubmitSection,
  canRespond,
  canSubmitSection,
  voiceUnavailable,
}: SpeakingConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns, isProcessingTurn, candidateState]);

  return (
    <div className="border border-[#E9E9E7] rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E9E9E7] bg-[#FAFAF9]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78]">
          Conversation
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D6A53]">
          <span className="w-2 h-2 rounded-full bg-[#2D6A53]" />
          Connected
        </span>
      </div>

      <div
        ref={scrollRef}
        className="p-4 space-y-3 min-h-[200px] max-h-[320px] overflow-y-auto"
      >
        {turns.length === 0 && (
          <p className="text-xs text-[#9B9A97] text-center py-6">
            Waiting for the examiner…
          </p>
        )}

        {turns.map((turn, index) =>
          turn.role === "examiner" ? (
            <div key={`${index}-examiner`} className="flex justify-start">
              <div className="max-w-[85%] bg-white border border-[#E9E9E7] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <p className="text-xs text-[#37352F] leading-relaxed">{turn.text}</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-[10px] text-[#9B9A97]">{formatTime()}</span>
                  <button
                    type="button"
                    onClick={() => onReplayTurn(index)}
                    disabled={isExaminerSpeaking}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5F5E5B] hover:text-[#37352F] disabled:opacity-50 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    Replay
                  </button>
                </div>
                {voiceUnavailable && index === 0 && (
                  <p className="text-[10px] text-[#7A7A78] mt-1">
                    French voice unavailable — read the cue above.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div key={`${index}-user`} className="flex justify-end">
              <div className="max-w-[85%] bg-[#37352F] text-white rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-xs leading-relaxed">{turn.text}</p>
              </div>
            </div>
          )
        )}

        {isExaminerSpeaking && (
          <p className="text-[10px] text-[#2D6A53] font-medium text-center">
            Examiner speaking…
          </p>
        )}

        {isProcessingTurn && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 bg-[#FAFAF9] border border-[#E9E9E7] rounded-2xl px-4 py-2 text-xs text-[#5F5E5B]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D6A53]" />
              L&apos;examinateur réfléchit…
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-2">
        {candidateState === "listening" ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onStopRecording}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B83E5C] hover:bg-[#A33652] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Listening… {recordingSeconds}s — tap to stop
            </button>
            <div className="h-2 bg-[#F1F1EF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2D6A53] rounded-full transition-all duration-75"
                style={{ width: `${Math.max(8, audioLevel)}%` }}
              />
            </div>
          </div>
        ) : candidateState === "processing" ? null : (
          <button
            type="button"
            onClick={onRespond}
            disabled={!canRespond}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FCECF0] border border-[#F8D4DE] hover:bg-[#F8D4DE] disabled:opacity-40 text-[#B83E5C] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Mic className="w-4 h-4" />
            Respond
          </button>
        )}

        {canSubmitSection && candidateState !== "listening" && !isProcessingTurn && (
          <button
            type="button"
            onClick={onSubmitSection}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D6A53] hover:bg-[#255a47] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Submit section
          </button>
        )}
      </div>
    </div>
  );
}
