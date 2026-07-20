import { useCallback, useEffect, useRef, useState } from "react";

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang.startsWith("fr-FR")) ??
    voices.find((v) => v.lang.startsWith("fr")) ??
    null
  );
}

export function useExaminerTts() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasFrenchVoice, setHasFrenchVoice] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const refreshVoices = useCallback(() => {
    setHasFrenchVoice(pickFrenchVoice() != null);
  }, []);

  useEffect(() => {
    refreshVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", refreshVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", refreshVoices);
      window.speechSynthesis?.cancel();
    };
  }, [refreshVoices]);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!window.speechSynthesis || !text.trim()) {
        onEnd?.();
        return;
      }

      // Cancel any in-flight utterance without treating interrupt as a successful end.
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      const utterance = new SpeechSynthesisUtterance(text.trim());
      const voice = pickFrenchVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = "fr-FR";
        setHasFrenchVoice(false);
      }
      utterance.rate = 0.92;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        onEnd?.();
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        // Interrupted means we cancelled to start a new utterance — do not fire onEnd.
        if (event.error === "interrupted" || event.error === "canceled") {
          return;
        }
        onEnd?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return {
    speak,
    cancel,
    isSpeaking,
    hasFrenchVoice,
  };
}
