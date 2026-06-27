import React, { useRef } from "react";
import FrenchAccentToolbar from "./FrenchAccentToolbar";

interface WritingTextAreaFieldProps {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function WritingTextAreaField({
  prompt,
  value,
  onChange,
  placeholder = "Rédigez votre réponse en français...",
  rows = 8,
}: WritingTextAreaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="border border-[#E9E9E7] rounded-xl overflow-hidden focus-within:border-[#1A73E8] transition-colors">
      <div className="bg-[#FAFAF9] border-b border-[#E9E9E7] px-4 py-3">
        <p className="text-sm font-bold text-[#37352F] leading-relaxed">{prompt}</p>
      </div>
      <FrenchAccentToolbar
        textareaRef={textareaRef}
        value={value}
        onChange={onChange}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full text-xs p-4 border-0 outline-none font-mono leading-relaxed resize-y bg-white"
      />
    </div>
  );
}
