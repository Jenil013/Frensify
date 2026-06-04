import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ZoomIn, X } from "lucide-react";

interface ListeningAudioPlayerProps {
  audioUrl?: string;
  imageUrl?: string;
  transcript?: string;
  /** Hide transcript during active exam (listening). */
  examMode?: boolean;
  /** Changes whenever the question changes so playback resets. */
  questionKey?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Listening question media: real <audio> playback for the document sonore plus
 * an optional illustration (TCF "match the image" items). Falls back to a
 * simulated progress bar when no audio URL is wired yet.
 */
export default function ListeningAudioPlayer({
  audioUrl,
  imageUrl,
  transcript,
  examMode = true,
  questionKey,
}: ListeningAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Reset playback whenever we move to a different question.
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [questionKey, audioUrl]);

  // Simulated playback fallback when no real audio source is available.
  useEffect(() => {
    if (audioUrl || !isPlaying) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return p + 2;
      });
    }, 250);
    return () => clearInterval(t);
  }, [audioUrl, isPlaying]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (el) {
      if (el.paused) {
        void el.play();
      } else {
        el.pause();
      }
      return;
    }
    setIsPlaying((p) => !p);
  };

  const resetAudio = () => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  return (
    <div className="space-y-3">
      <div className="bg-[#EBF3FC] border border-[#D2E7F6] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            className="w-10 h-10 rounded-full bg-[#1A73E8] text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1D74B4]">Document sonore</p>
            {audioUrl ? (
              <p className="text-[10px] text-[#55698B] tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            ) : (
              <p className="text-[10px] text-[#55698B]">
                Simulated playback (Supabase audio URL when available)
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={resetAudio}
            aria-label="Restart audio"
            className="p-1.5 border border-[#CDDFD9] rounded cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-3 h-1.5 bg-white/60 rounded overflow-hidden">
          <div
            className="h-full bg-[#1A73E8] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            className="hidden"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setProgress(100);
            }}
            onLoadedMetadata={(e) =>
              setDuration(e.currentTarget.duration || 0)
            }
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              setCurrentTime(el.currentTime);
              if (el.duration > 0) {
                setProgress((el.currentTime / el.duration) * 100);
              }
            }}
          />
        )}
        {!examMode && transcript && (
          <p className="mt-3 text-xs italic text-[#5F5E5B]">{transcript}</p>
        )}
      </div>

      {imageUrl && (
        <div className="bg-white border border-[#E9E9E7] rounded-xl p-3">
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="group relative block w-full cursor-zoom-in"
            aria-label="Enlarge image"
          >
            <img
              src={imageUrl}
              alt="Illustration de la question"
              className="w-full max-h-64 object-contain rounded-lg"
            />
            <span className="absolute top-2 right-2 bg-black/45 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}

      {zoomed && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close image"
            className="absolute top-4 right-4 bg-white/90 text-[#37352F] rounded-full p-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={imageUrl}
            alt="Illustration de la question"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
