// ============================================
// PDF Export Utility
// Playbook PDF 생성 (Scout Card 템플릿 포함)
// ============================================

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Play, ExportSettings } from "@/domain/dsl/types";

// ============================================
// Constants
// ============================================

const PAGE_WIDTH = 612; // Letter size in points (8.5 inches)
const PAGE_HEIGHT = 792; // Letter size in points (11 inches)
const MARGIN = 36; // 0.5 inch margin
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const CONTENT_HEIGHT = PAGE_HEIGHT - 2 * MARGIN;

// Scout Card dimensions
const DIAGRAM_WIDTH = CONTENT_WIDTH;
const DIAGRAM_HEIGHT = 350;
const INFO_BOX_HEIGHT = 60;
const NOTES_HEIGHT = 100;

// ============================================
// Types
// ============================================

export interface PdfExportOptions {
  plays: Play[];
  playbookName: string;
  settings?: ExportSettings;
  maxPages?: number;
}

export interface ScoutCardData {
  play: Play;
  down?: string;
  distance?: string;
  hash?: "L" | "M" | "R";
  callName?: string;
}

// ============================================
// SVG to Image Conversion
// ============================================

async function svgToDataUrl(
  svgElement: SVGSVGElement,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));

    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2; // Higher resolution
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.fillStyle = "#FAFBFC";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };
    img.src = url;
  });
}

// ============================================
// Capture Play Diagram
// ============================================

async function capturePlayDiagram(
  containerId: string,
  playIndex: number
): Promise<string | null> {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Find the specific play SVG
  const svgElements = container.querySelectorAll("svg");
  const svgElement = svgElements[playIndex];
  if (!svgElement) return null;

  try {
    return await svgToDataUrl(svgElement as SVGSVGElement, 800, 600);
  } catch {
    return null;
  }
}

// ============================================
// PDF Generation Functions
// ============================================

function addCoverPage(pdf: jsPDF, playbookName: string, playCount: number) {
  // Title
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  pdf.text(playbookName, PAGE_WIDTH / 2, 200, { align: "center" });

  // Subtitle
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${playCount} Plays`, PAGE_WIDTH / 2, 240, { align: "center" });

  // Date
  pdf.setFontSize(12);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(date, PAGE_WIDTH / 2, 280, { align: "center" });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text("Created with ForOffenseCoach", PAGE_WIDTH / 2, PAGE_HEIGHT - 50, {
    align: "center",
  });
  pdf.setTextColor(0, 0, 0);
}

function addScoutCardPage(
  pdf: jsPDF,
  play: Play,
  imageDataUrl: string | null,
  settings?: ExportSettings
) {
  const pageStyle = settings?.pageStyle || "classic";
  const includeNotes = settings?.includeNotes ?? true;

  // Header: Play name
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(play.name || "Untitled Play", MARGIN, MARGIN + 20);

  // Meta info line
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  const metaLine = [
    play.meta?.personnel,
    play.meta?.formationId?.replace("formation_", ""),
    play.meta?.conceptId?.replace("concept_", ""),
  ]
    .filter(Boolean)
    .join(" • ");
  pdf.text(metaLine, MARGIN, MARGIN + 35);
  pdf.setTextColor(0, 0, 0);

  // Scout Card Info Boxes (for classic style)
  let diagramStartY = MARGIN + 50;
  if (pageStyle === "classic") {
    const boxWidth = (CONTENT_WIDTH - 30) / 4;
    const boxY = MARGIN + 45;
    const boxes = [
      { label: "DOWN", value: play.meta?.down || "-" },
      { label: "DISTANCE", value: play.meta?.distance || "-" },
      { label: "HASH", value: play.meta?.hash || "M" },
      { label: "CALL", value: play.meta?.callName || play.name?.slice(0, 12) || "-" },
    ];

    boxes.forEach((box, i) => {
      const x = MARGIN + i * (boxWidth + 10);

      // Box outline
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(x, boxY, boxWidth, INFO_BOX_HEIGHT);

      // Label
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(box.label, x + boxWidth / 2, boxY + 15, { align: "center" });

      // Value
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(box.value), x + boxWidth / 2, boxY + 40, { align: "center" });
    });

    diagramStartY = boxY + INFO_BOX_HEIGHT + 15;
  }

  // Play Diagram
  if (imageDataUrl) {
    const aspectRatio = 800 / 600;
    const diagramWidth = CONTENT_WIDTH;
    const diagramHeight = diagramWidth / aspectRatio;

    pdf.addImage(
      imageDataUrl,
      "PNG",
      MARGIN,
      diagramStartY,
      diagramWidth,
      Math.min(diagramHeight, DIAGRAM_HEIGHT)
    );
  } else {
    // Placeholder if no image
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(250, 251, 252);
    pdf.rect(MARGIN, diagramStartY, CONTENT_WIDTH, DIAGRAM_HEIGHT, "FD");
    pdf.setFontSize(14);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "Diagram not available",
      MARGIN + CONTENT_WIDTH / 2,
      diagramStartY + DIAGRAM_HEIGHT / 2,
      { align: "center" }
    );
    pdf.setTextColor(0, 0, 0);
  }

  // Coaching Notes
  const notesY = diagramStartY + Math.min(DIAGRAM_HEIGHT, 350) + 20;
  if (includeNotes && play.notes?.coachingPoints && play.notes.coachingPoints.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Coaching Points", MARGIN, notesY);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    let noteY = notesY + 15;
    play.notes.coachingPoints.slice(0, 5).forEach((point, i) => {
      if (noteY < PAGE_HEIGHT - MARGIN - 30) {
        pdf.text(`• ${point}`, MARGIN + 10, noteY);
        noteY += 12;
      }
    });
  }

  // Page footer
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(play.name || "Play", MARGIN, PAGE_HEIGHT - 20);
  pdf.setTextColor(0, 0, 0);
}

function addPageNumber(pdf: jsPDF, pageNum: number, totalPages: number) {
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Page ${pageNum} of ${totalPages}`,
    PAGE_WIDTH - MARGIN,
    PAGE_HEIGHT - 20,
    { align: "right" }
  );
  pdf.setTextColor(0, 0, 0);
}

// ============================================
// Main Export Function
// ============================================

export async function exportPlaybookToPdf(
  options: PdfExportOptions,
  diagramImages: (string | null)[]
): Promise<Blob> {
  const { plays, playbookName, settings, maxPages = 10 } = options;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  // Limit to max pages
  const limitedPlays = plays.slice(0, maxPages);
  const totalPages = limitedPlays.length + 1; // +1 for cover

  // Cover page
  addCoverPage(pdf, playbookName, limitedPlays.length);
  addPageNumber(pdf, 1, totalPages);

  // Play pages
  for (let i = 0; i < limitedPlays.length; i++) {
    pdf.addPage();
    addScoutCardPage(pdf, limitedPlays[i], diagramImages[i] || null, settings);
    addPageNumber(pdf, i + 2, totalPages);
  }

  return pdf.output("blob");
}

// ============================================
// Export Single Play as PNG
// ============================================

export async function exportPlayToPng(svgElement: SVGSVGElement): Promise<Blob> {
  const dataUrl = await svgToDataUrl(svgElement, 800, 600);
  const response = await fetch(dataUrl);
  return response.blob();
}

// ============================================
// Helper: Create image from Play SVG in DOM
// ============================================

export async function capturePlaySvgAsImage(
  containerRef: HTMLElement
): Promise<string | null> {
  const svgElement = containerRef.querySelector("svg");
  if (!svgElement) return null;

  try {
    return await svgToDataUrl(svgElement as SVGSVGElement, 800, 600);
  } catch {
    return null;
  }
}

// ============================================
// Render Play to Off-screen SVG and Capture
// ============================================

export function renderPlayToSvgString(play: Play): string {
  // This creates an SVG string that can be used server-side or for image generation
  // For now, we rely on client-side rendering
  return "";
}
