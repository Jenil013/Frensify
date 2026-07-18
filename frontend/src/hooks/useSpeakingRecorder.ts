import { useCallback, useEffect, useRef, useState } from "react";

export type SpeakingRecorderStatus = "idle" | "recording" | "recorded" | "error";

export interface SpeakingRecording {
  blob: Blob;
  durationSeconds: number;
  peakAudioLevel: number;
}

export interface UseSpeakingRecorderOptions {
  maxSeconds?: number;
  onMaxDuration?: () => void;
}

export function useSpeakingRecorder(options: UseSpeakingRecorderOptions = {}) {
  const { maxSeconds, onMaxDuration } = options;
  const [status, setStatus] = useState<SpeakingRecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [peakAudioLevel, setPeakAudioLevel] = useState(0);
  const [recording, setRecording] = useState<SpeakingRecording | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelFrameRef = useRef<number | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingSecondsRef = useRef(0);
  const peakAudioLevelRef = useRef(0);

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
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopLevelMeter]);

  const clearTimer = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    releaseStream();
    setStatus("idle");
    setError(null);
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
    setPeakAudioLevel(0);
    peakAudioLevelRef.current = 0;
    setRecording(null);
  }, [clearTimer, releaseStream]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const level = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(level);
        if (level > peakAudioLevelRef.current) {
          peakAudioLevelRef.current = level;
          setPeakAudioLevel(level);
        }
        levelFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is optional */
    }
  }, []);

  const stopRecording = useCallback((): Promise<SpeakingRecording | null> => {
    return new Promise((resolve) => {
      clearTimer();
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state !== "recording") {
        resolve(recording);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const result: SpeakingRecording = {
          blob,
          durationSeconds: recordingSecondsRef.current,
          peakAudioLevel: peakAudioLevelRef.current,
        };
        releaseStream();
        setRecording(result);
        setStatus("recorded");
        resolve(result);
      };

      recorder.stop();
    });
  }, [clearTimer, recording, releaseStream]);

  const startRecording = useCallback(async () => {
    reset();
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("Microphone access is not supported in this browser.");
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

      recorder.start();
      setStatus("recording");
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;
      setPeakAudioLevel(0);
      peakAudioLevelRef.current = 0;

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          const next = s + 1;
          recordingSecondsRef.current = next;
          if (maxSeconds != null && next >= maxSeconds) {
            clearTimer();
            void stopRecording();
            onMaxDuration?.();
            return maxSeconds;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      releaseStream();
      setStatus("error");
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow access in your browser settings."
          : "Could not access your microphone. Check your device and try again.";
      setError(message);
    }
  }, [
    reset,
    startLevelMeter,
    releaseStream,
    maxSeconds,
    clearTimer,
    stopRecording,
    onMaxDuration,
  ]);

  return {
    status,
    error,
    recordingSeconds,
    audioLevel,
    peakAudioLevel,
    recording,
    startRecording,
    stopRecording,
    reset,
    isRecording: status === "recording",
  };
}
