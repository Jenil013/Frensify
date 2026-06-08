import React from "react";
import { Mic, Volume2 } from "lucide-react";

export type CandidateState = "idle" | "listening" | "recorded";

interface SpeakingConversationPanelProps {
  examinerCue: string;
  examinerTimestamp?: string;
  isExaminerSpeaking: boolean;
  candidateState: CandidateState;
  recordingSeconds: number;
  audioLevel: number;
  onRespond: () => void;
  onStopRecording: () => void;
  onReplayExaminer: () => void;
  canRespond: boolean;
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
  examinerCue,
  examinerTimestamp,
  isExaminerSpeaking,
  candidateState,
  recordingSeconds,
  audioLevel,
  onRespond,
  onStopRecording,
  onReplayExaminer,
  canRespond,
  voiceUnavailable,
}: SpeakingConversationPanelProps) {
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

      <div className="p-4 space-y-3 min-h-[200px]">
        <div className="flex justify-start">
          <div className="max-w-[85%] bg-white border border-[#E9E9E7] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-xs text-[#37352F] leading-relaxed">{examinerCue}</p>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-[10px] text-[#9B9A97]">
                {examinerTimestamp ?? formatTime()}
              </span>
              <button
                type="button"
                onClick={onReplayExaminer}
                disabled={isExaminerSpeaking}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5F5E5B] hover:text-[#37352F] disabled:opacity-50 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                Replay
              </button>
            </div>
            {isExaminerSpeaking && (
              <p className="text-[10px] text-[#2D6A53] font-medium mt-1">Examiner speaking…</p>
            )}
            {voiceUnavailable && (
              <p className="text-[10px] text-[#7A7A78] mt-1">
                French voice unavailable — read the cue above.
              </p>
            )}
          </div>
        </div>

        {candidateState === "recorded" && (
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-[#37352F] text-white rounded-2xl rounded-tr-sm px-4 py-3">
              <p className="text-xs leading-relaxed">Response recorded ({recordingSeconds}s)</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
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
        ) : candidateState === "recorded" ? (
          <p className="text-center text-xs text-[#2D6A53] font-medium py-2">
            Recording saved for this task.
          </p>
        ) : (
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
      </div>
    </div>
  );
}
