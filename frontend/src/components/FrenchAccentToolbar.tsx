import React, { useEffect, useRef } from "react";

const FRENCH_ACCENTS = [
  "à",
  "â",
  "ä",
  "ç",
  "é",
  "è",
  "ê",
  "ë",
  "î",
  "ï",
  "ô",
  "ù",
  "û",
  "ü",
  "œ",
] as const;

function shouldCapitalizeAt(value: string, position: number): boolean {
  if (position === 0) return true;

  const before = value.slice(0, position).trimEnd();
  if (before.length === 0) return true;

  const lastChar = before[before.length - 1];
  return lastChar === "." || lastChar === "!" || lastChar === "?" || lastChar === "\n";
}

function accentToInsert(char: string, value: string, position: number): string {
  return shouldCapitalizeAt(value, position) ? char.toLocaleUpperCase("fr-FR") : char;
}

interface FrenchAccentToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export default function FrenchAccentToolbar({
  textareaRef,
  value,
  onChange,
}: FrenchAccentToolbarProps) {
  const pendingCursor = useRef<number | null>(null);

  useEffect(() => {
    if (pendingCursor.current === null || !textareaRef.current) return;
    const pos = pendingCursor.current;
    pendingCursor.current = null;
    const el = textareaRef.current;
    el.focus();
    el.setSelectionRange(pos, pos);
  }, [value, textareaRef]);

  const insertChar = (char: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const inserted = accentToInsert(char, value, start);
    pendingCursor.current = start + inserted.length;
    onChange(value.slice(0, start) + inserted + value.slice(end));
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 px-3 py-2 bg-[#F1F1EF] border-b border-[#E9E9E7]"
      role="toolbar"
      aria-label="French accent characters"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A78] mr-1 shrink-0">
        Accents:
      </span>
      {FRENCH_ACCENTS.map((char) => (
        <button
          key={char}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertChar(char)}
          className="min-w-[1.75rem] h-7 px-1.5 text-sm font-mono text-[#37352F] bg-[#E9E9E7] hover:bg-[#DFDFDD] rounded-md border border-[#E9E9E7] transition-colors cursor-pointer"
          aria-label={`Insert ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
