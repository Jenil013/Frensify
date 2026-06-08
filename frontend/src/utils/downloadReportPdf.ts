import { jsPDF } from "jspdf";
import type { AIWritingCorrection, AISpeakingSuggestion, FullExamReport } from "../types";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 5.5;

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize = 10
): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * LINE_HEIGHT;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

function writeWritingSection(
  doc: jsPDF,
  label: string,
  feedback: AIWritingCorrection,
  startY: number
): number {
  let y = ensureSpace(doc, startY, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(45, 106, 83);
  doc.text(label, MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 53, 47);
  y = addWrappedText(
    doc,
    `CEFR ${feedback.cefrScore} · ${feedback.scoreRange}`,
    MARGIN,
    y,
    CONTENT_WIDTH,
    9
  );
  y += 3;
  y = addWrappedText(doc, feedback.overallFeedback, MARGIN, y, CONTENT_WIDTH, 9);
  y += 4;

  for (const [key, note] of Object.entries(feedback.dimensionScores)) {
    y = ensureSpace(doc, y, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(key, MARGIN, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    y = addWrappedText(doc, note, MARGIN, y, CONTENT_WIDTH, 8);
    y += 2;
  }

  return y + 6;
}

function writeSpeakingSection(
  doc: jsPDF,
  label: string,
  feedback: AISpeakingSuggestion,
  startY: number
): number {
  let y = ensureSpace(doc, startY, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(45, 106, 83);
  doc.text(label, MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 53, 47);
  y = addWrappedText(doc, `CEFR ${feedback.cefrLevel}`, MARGIN, y, CONTENT_WIDTH, 9);
  y += 2;
  y = addWrappedText(
    doc,
    `Fluency: ${feedback.fluencyFeedback}`,
    MARGIN,
    y,
    CONTENT_WIDTH,
    8
  );
  y += 2;
  y = addWrappedText(
    doc,
    `Grammar & vocabulary: ${feedback.grammarAndVocab}`,
    MARGIN,
    y,
    CONTENT_WIDTH,
    8
  );
  y += 2;
  y = addWrappedText(
    doc,
    `Structure: ${feedback.structureAnalysis}`,
    MARGIN,
    y,
    CONTENT_WIDTH,
    8
  );
  return y + 8;
}

export function downloadReportPdf(report: FullExamReport): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFillColor(234, 245, 241);
  doc.rect(0, 0, PAGE_WIDTH, 42, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(45, 106, 83);
  doc.text("Frensify Exam Report", MARGIN, y + 8);

  doc.setFontSize(11);
  doc.setTextColor(55, 53, 47);
  doc.text(report.examName, MARGIN, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(122, 122, 120);
  doc.text(
    `${report.examType} · ${report.date} · Comprehension aggregate ${report.comprehensionAggregatePct}% · Est. ${report.estimatedCefr}`,
    MARGIN,
    y + 23
  );

  y = 52;

  for (const mod of report.modules) {
    y = ensureSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(55, 53, 47);
    doc.text(mod.moduleLabel, MARGIN, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 106, 83);

    if (mod.type === "mcq" && mod.rawScore != null && mod.maxScore != null) {
      y = addWrappedText(
        doc,
        `Score: ${mod.rawScore}/${mod.maxScore} (${mod.scorePct}%) · CEFR estimate ${mod.cefrEstimate ?? "—"}`,
        MARGIN,
        y,
        CONTENT_WIDTH,
        10
      );
      y += 6;
    }

    if (mod.type === "writing" && mod.writingSections) {
      mod.writingSections.forEach((section, idx) => {
        if (!section.feedback) return;
        const label = mod.sectionLabels?.[idx] ?? `Task ${idx + 1}`;
        y = writeWritingSection(doc, label, section.feedback, y);
      });
    }

    if (mod.type === "oral" && mod.oralSections) {
      if (mod.cefrEstimate) {
        y = addWrappedText(
          doc,
          `Overall oral estimate: ${mod.cefrEstimate}`,
          MARGIN,
          y,
          CONTENT_WIDTH,
          9
        );
        y += 4;
      }
      mod.oralSections.forEach((section, idx) => {
        if (!section.feedback) return;
        const label = mod.sectionLabels?.[idx] ?? `Task ${idx + 1}`;
        y = writeSpeakingSection(doc, label, section.feedback, y);
      });
    }

    y += 4;
  }

  y = ensureSpace(doc, y, 20);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(122, 122, 120);
  addWrappedText(
    doc,
    "CEFR levels and AI feedback are estimates for study purposes — not official TEF/TCF scores.",
    MARGIN,
    y,
    CONTENT_WIDTH,
    8
  );

  const safeName = report.examName.replace(/[^\w\s-]/g, "").trim().slice(0, 40);
  doc.save(`Frensify-${safeName || "exam"}-report.pdf`);
}
