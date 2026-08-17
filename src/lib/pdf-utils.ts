/**
 * PDF processing utilities.
 * Client-side only — menggunakan pdfjs-dist untuk render halaman PDF.
 */

import type { PDFDocumentProxy } from "pdfjs-dist";

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

/**
 * Lazy-load pdfjs-dist dan set worker.
 * Dipanggil sekali saat pertama kali dibutuhkan.
 */
async function getPdfJs(): Promise<typeof import("pdfjs-dist")> {
  if (pdfjsLib) return pdfjsLib;
  const lib = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  pdfjsLib = lib;
  return lib;
}

/**
 * Load PDF dari File object.
 */
export async function loadPdfFromFile(
  file: File
): Promise<PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  return loadPdfFromBuffer(arrayBuffer);
}

/**
 * Load PDF dari ArrayBuffer.
 */
export async function loadPdfFromBuffer(
  buffer: ArrayBuffer
): Promise<PDFDocumentProxy> {
  const lib = await getPdfJs();
  const pdf = await lib.getDocument({ data: buffer }).promise;
  return pdf;
}

/**
 * Render satu halaman PDF menjadi data URL (image/png).
 */
export async function renderPageToImage(
  pdf: PDFDocumentProxy,
  pageNum: number,
  scale: number = 2.0
): Promise<string> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/png");
}

/**
 * Generate thumbnail kecil dari halaman pertama PDF.
 */
export async function generateThumbnail(
  pdf: PDFDocumentProxy,
  scale: number = 0.3
): Promise<string> {
  return renderPageToImage(pdf, 1, scale);
}

/**
 * Extract metadata dasar dari PDF.
 */
export async function getPdfMetadata(
  pdf: PDFDocumentProxy
): Promise<{ title: string; pageCount: number }> {
  const metadata = await pdf.getMetadata();
  const info = metadata.info as Record<string, unknown> | null;
  const title =
    (typeof info?.["Title"] === "string" && info["Title"]) || "";

  return {
    title,
    pageCount: pdf.numPages,
  };
}
