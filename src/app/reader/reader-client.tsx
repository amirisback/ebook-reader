"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

import type { Dictionary } from "@/lib/dictionaries";
import { loadPdfFromFile, loadPdfFromBuffer, generateThumbnail, getPdfMetadata } from "@/lib/pdf-utils";
import { getPdfFromDB } from "@/lib/pdf-db";
import { saveRecentDocument, getRecentDocuments } from "@/lib/storage";
import { PdfViewer, type FlipBookHandle } from "@/app/_components/pdf-viewer";
import { ReaderToolbar } from "@/app/_components/reader-toolbar";

interface ReaderClientProps {
  dict: Dictionary;
}

export function ReaderClient({ dict }: ReaderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const flipBookRef = useRef<FlipBookHandle | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSinglePage, setIsSinglePage] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : true
  );
  const [fileName, setFileName] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);

  // Timer auto-hide toolbar
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4500);
  }, []);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Handler pergantian halaman
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);

      // Flip ke halaman yang diminta via react-pageflip API
      if (flipBookRef.current) {
        flipBookRef.current.pageFlip()?.flip(page - 1);
      }

      // Update riwayat pembacaan
      if (docId || fileName) {
        const docs = getRecentDocuments();
        const existing = docs.find(
          (d) => d.id === docId || d.title === fileName.replace(/\.pdf$/i, "")
        );
        if (existing) {
          saveRecentDocument({
            ...existing,
            lastPage: page - 1,
          });
        }
      }
    },
    [docId, fileName]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleToggleViewMode = useCallback(() => {
    setIsSinglePage((prev) => !prev);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  // Load PDF dari IndexedDB atau sessionStorage
  useEffect(() => {
    let active = true;

    async function loadPdfDocument(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        let pdfDoc: PDFDocumentProxy | null = null;
        let title = "";
        let initialPageNum = 1;

        // 1. Coba ambil dari IndexedDB menggunakan ID
        if (docId) {
          const buffer = await getPdfFromDB(docId);
          if (buffer) {
            pdfDoc = await loadPdfFromBuffer(buffer);

            // Ambil info dari recent documents jika ada
            const recent = getRecentDocuments().find((d) => d.id === docId);
            if (recent) {
              title = recent.title;
              initialPageNum = Math.max(1, recent.lastPage + 1);
            }
          }
        }

        // 2. Fallback: Coba ambil dari sessionStorage
        if (!pdfDoc) {
          const blobUrl = sessionStorage.getItem("docuflip_pdf_url");
          const name = sessionStorage.getItem("docuflip_pdf_name") || "";
          const lastPageStr = sessionStorage.getItem("docuflip_last_page");

          if (blobUrl) {
            title = name;
            const res = await fetch(blobUrl);
            const blob = await res.blob();
            const file = new File([blob], name, { type: "application/pdf" });
            pdfDoc = await loadPdfFromFile(file);

            if (lastPageStr) {
              initialPageNum = Math.max(1, Number(lastPageStr) + 1);
            }
          }
        }

        if (!active) return;

        if (pdfDoc) {
          setPdf(pdfDoc);
          setTotalPages(pdfDoc.numPages);
          setFileName(title);
          setCurrentPage(initialPageNum);
          setLoading(false);
          showControlsTemporarily();

          // Perbarui metadata & thumbnail di background secara non-blocking
          const doc = pdfDoc;
          getPdfMetadata(doc).then(async (meta) => {
            const finalTitle = title || meta.title;
            if (finalTitle) setFileName(finalTitle);

            const thumb = await generateThumbnail(doc, 0.35).catch(() => "");
            const docs = getRecentDocuments();
            const existing = docs.find((d) => d.id === docId || d.title === title);
            if (existing) {
              saveRecentDocument({
                ...existing,
                title: finalTitle || existing.title,
                pageCount: doc.numPages,
                thumbnail: thumb || existing.thumbnail,
              });
            }
          }).catch(() => {});
        } else {
          setError("no_document");
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat PDF:", err);
        if (active) {
          setError("load_failed");
          setLoading(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [docId, showControlsTemporarily]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "ArrowLeft" && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      } else if (e.key === "Escape" && isFullscreen) {
        handleToggleFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, isFullscreen, handlePageChange, handleToggleFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    function onFullscreenChange(): void {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Error: No document
  if (error === "no_document") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-reader-bg p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          {dict.reader.noDocument}
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          {dict.reader.noDocumentDesc}
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {dict.reader.backToHome}
        </Link>
      </div>
    );
  }

  // Error: Load failed
  if (error === "load_failed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-reader-bg p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          {dict.common.error}
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          {dict.reader.errorLoading}
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {dict.reader.backToHome}
        </Link>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-reader-bg">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">
          {dict.reader.loadingPdf}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-reader-bg select-none">
      {/* Top & Bottom Toolbars */}
      <ReaderToolbar
        dict={dict}
        title={fileName}
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        isSinglePage={isSinglePage}
        onPageChange={handlePageChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleViewMode={handleToggleViewMode}
        isFullscreen={isFullscreen}
        onBack={handleBack}
        visible={controlsVisible}
      />

      {/* PDF Flipbook Viewer Area */}
      <main className="flex flex-1 items-center justify-center overflow-hidden pt-14 pb-16">
        {pdf && (
          <PdfViewer
            dict={dict}
            pdf={pdf}
            initialPage={currentPage - 1}
            zoom={zoom}
            isSinglePage={isSinglePage}
            onPageChange={setCurrentPage}
            onToggleControls={toggleControls}
            flipBookRef={flipBookRef}
          />
        )}
      </main>
    </div>
  );
}
