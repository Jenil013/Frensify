import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Mic,
  Play,
  Square,
  X,
  AlertCircle,
  Loader2,
  Volume2,
} from "lucide-react";
import {
  SPEAKING_PRECHECK_INSTRUCTIONS,
  speakingPrecheckDurationLine,
} from "../constants/speakingPrecheck";

export interface SpeakingPrecheckModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  estimatedMinutes?: number;
  title?: string;
  subtitle?: string;
}

type MicTestStatus = "idle" | "recording" | "recorded" | "playing" | "error";

export default function SpeakingPrecheckModal({
  open,
  onConfirm,
  onCancel,
  estimatedMinutes = 15,
  title = "Pre-Exam Setup",
  subtitle = "Complete the following steps to ensure you're ready for the speaking session.",
}: SpeakingPrecheckModalProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [micStatus, setMicStatus] = useState<MicTestStatus>("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelFrameRef = useRef<number | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const instructionItems = [
    ...SPEAKING_PRECHECK_INSTRUCTIONS.slice(0, 5),
    speakingPrecheckDurationLine(estimatedMinutes),
    ...SPEAKING_PRECHECK_INSTRUCTIONS.slice(5),
  ];

  const allChecked = instructionItems.every((_, i) => checked[i]);
  const micVerified = micStatus === "recorded" || micStatus === "playing";
  const canStart = allChecked && micVerified;

  const stopLevelMeter = useCallback(() => {
    if (levelFrameRef.current != null) {
      cancelAnimationFrame(levelFrameRef.current);
      levelFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const releaseStream = useCallback(() => {
    stopLevelMeter();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    analyserRef.current = null;
  }, [stopLevelMeter]);

  const resetMicTest = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    releaseStream();
    setMicStatus("idle");
    setMicError(null);
    setRecordSeconds(0);
  }, [releaseStream]);

  useEffect(() => {
    if (open) {
      setChecked({});
      resetMicTest();
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
        resetMicTest();
      };
    }
    resetMicTest();
    return undefined;
  }, [open, resetMicTest]);

  useEffect(() => {
    return () => {
      resetMicTest();
      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
      }
    };
  }, [resetMicTest]);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        levelFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is optional */
    }
  }, []);

  const startMicTest = async () => {
    resetMicTest();
    setMicError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("error");
      setMicError("Microphone access is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      startLevelMeter(stream);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
        recordingUrlRef.current = URL.createObjectURL(blob);
        releaseStream();
        setMicStatus("recorded");
      };

      recorder.start();
      setMicStatus("recording");
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);

      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
          }
        }
      }, 4000);
    } catch (err) {
      releaseStream();
      setMicStatus("error");
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow access in your browser settings and try again."
          : "Could not access your microphone. Check your device and try again.";
      setMicError(message);
    }
  };

  const playRecording = () => {
    if (!recordingUrlRef.current) return;
    const audio = new Audio(recordingUrlRef.current);
    audioRef.current = audio;
    setMicStatus("playing");
    audio.onended = () => setMicStatus("recorded");
    audio.onerror = () => {
      setMicStatus("recorded");
      setMicError("Playback failed. You can record again.");
    };
    void audio.play();
  };

  const stopPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (micStatus === "playing") setMicStatus("recorded");
  };

  const toggleInstruction = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaking-precheck-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/30 backdrop-blur-[2px]"
        aria-label="Cancel setup"
        onClick={onCancel}
      />

      <div
        className="relative w-full max-w-lg max-h-[min(90vh,720px)] bg-white rounded-2xl shadow-xl border border-[#E9E9E7] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[#E9E9E7]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="speaking-precheck-title"
                className="text-lg font-bold text-[#37352F] tracking-tight"
              >
                {title}
              </h2>
              <p className="text-xs text-[#7A7A78] mt-1 leading-relaxed">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-[#7A7A78] hover:bg-[#F1F1EF] hover:text-[#37352F] transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#37352F]">Instructions</h3>
              <p className="text-xs text-[#7A7A78] mt-0.5">
                Please read and accept the following instructions:
              </p>
            </div>

            <ul className="space-y-2">
              {instructionItems.map((text, index) => {
                const isOn = !!checked[index];
                return (
                  <li key={text}>
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isOn
                          ? "bg-[#EAF5F1]/50 border-[#D1EBE1]"
                          : "bg-[#FAFAF9] border-[#E9E9E7] hover:border-[#D1EBE1]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => toggleInstruction(index)}
                        className="mt-0.5 w-4 h-4 rounded border-[#C4C4C0] text-[#2D6A53] focus:ring-[#2D6A53]/30 shrink-0"
                      />
                      <span className="text-xs text-[#37352F] leading-relaxed">{text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div
          className="shrink-0 border-t border-[#E9E9E7] bg-[#FAFAF9]"
          data-testid="speaking-precheck-mic"
        >
          <div className="bg-[#2D6A53] px-6 py-4">
            <h3 className="text-sm font-bold text-white">Microphone Test</h3>
            <p className="text-xs text-white/90 mt-0.5">
              Record a short clip to test your microphone.
            </p>
          </div>

          <div className="px-6 py-4 space-y-3 bg-white">
            {micStatus === "recording" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5F5E5B]">
                  <span className="font-medium text-[#B83E5C] flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#B83E5C] rounded-full animate-ping" />
                    Recording… {recordSeconds}s
                  </span>
                  <span>Speak a short phrase</span>
                </div>
                <div className="h-2 bg-[#F1F1EF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2D6A53] rounded-full transition-all duration-75"
                    style={{ width: `${Math.max(8, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}

            {micStatus === "recorded" && (
              <div className="flex items-center gap-2 text-xs text-[#2D6A53] font-medium bg-[#EAF5F1] border border-[#D1EBE1] rounded-lg px-3 py-2">
                <Check className="w-4 h-4 shrink-0" />
                Microphone test recorded successfully.
              </div>
            )}

            {micStatus === "error" && micError && (
              <div className="flex items-start gap-2 text-xs text-[#B83E5C] bg-[#FCECF0] border border-[#F8D4DE] rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{micError}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(micStatus === "idle" || micStatus === "error") && (
                <button
                  type="button"
                  onClick={() => void startMicTest()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#37352F] hover:bg-[#2F2E2A] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  Test Microphone
                </button>
              )}

              {micStatus === "recording" && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F1F1EF] text-[#7A7A78] text-xs font-bold rounded-xl cursor-wait"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording…
                </button>
              )}

              {(micStatus === "recorded" || micStatus === "playing") && (
                <>
                  <button
                    type="button"
                    onClick={micStatus === "playing" ? stopPlayback : playRecording}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9E9E7] hover:bg-[#F1F1EF] text-[#37352F] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {micStatus === "playing" ? (
                      <>
                        <Square className="w-3.5 h-3.5" /> Stop playback
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Play recording
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void startMicTest()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9E9E7] hover:bg-[#F1F1EF] text-[#5F5E5B] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Record again
                  </button>
                </>
              )}
            </div>

            <p className="text-[10px] text-[#9B9A97] flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Use headphones if possible to avoid echo during the session.
            </p>
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#E9E9E7] bg-white rounded-b-2xl">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-[#5F5E5B] hover:bg-[#F1F1EF] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canStart}
              onClick={onConfirm}
              className="px-5 py-2.5 bg-[#2D6A53] hover:bg-[#245642] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Start speaking session
            </button>
          </div>
          {!canStart && (
            <p className="text-[10px] text-center text-[#9B9A97] mt-2">
              {!allChecked
                ? "Check all instructions to continue."
                : "Complete the microphone test to continue."}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
