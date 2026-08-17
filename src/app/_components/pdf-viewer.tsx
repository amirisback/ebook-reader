"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PageFlip } from "page-flip";
import type { Dictionary } from "@/lib/dictionaries";
import { renderPageToImage } from "@/lib/pdf-utils";

export interface FlipBookHandle {
  pageFlip: () => PageFlip | null;
}

interface PdfViewerProps {
  dict: Dictionary;
  pdf: PDFDocumentProxy;
  initialPage?: number;
  zoom: number;
  isSinglePage: boolean;
  onPageChange?: (page: number) => void;
  onToggleControls?: () => void;
  flipBookRef?: React.RefObject<FlipBookHandle | null>;
}

export function PdfViewer({
  dict,
  pdf,
  initialPage = 0,
  zoom,
  isSinglePage,
  onPageChange,
  onToggleControls,
  flipBookRef,
}: PdfViewerProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [renderedCount, setRenderedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(0.707); // Default A4
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipInstance = useRef<PageFlip | null>(null);

  // Ekspos instance ke parent via flipBookRef
  useEffect(() => {
    if (flipBookRef) {
      flipBookRef.current = {
        pageFlip: () => pageFlipInstance.current,
      };
    }
  }, [flipBookRef]);

  // Ambil rasio asli dari halaman pertama PDF
  useEffect(() => {
    let active = true;
    async function measurePdf() {
      try {
        const page1 = await pdf.getPage(1);
        const viewport = page1.getViewport({ scale: 1 });
        if (active && viewport.width && viewport.height) {
          setAspectRatio(viewport.width / viewport.height);
        }
      } catch (err) {
        console.warn("Gagal mengukur viewport PDF:", err);
      }
    }
    measurePdf();
    return () => {
      active = false;
    };
  }, [pdf]);

  // Hitung dimensi flipbook responsif
  useEffect(() => {
    function calculateSize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isMobile = rect.width < 768;
      const useSingle = isSinglePage || isMobile;

      const paddingX = isMobile ? 16 : 48;
      const paddingY = isMobile ? 24 : 48;

      const availW = Math.max(200, rect.width - paddingX);
      const availH = Math.max(300, rect.height - paddingY);

      // Jika single page: 1 halaman = availW
      // Jika double page (desktop): 1 halaman = availW / 2
      const targetPageWidth = useSingle ? availW : availW / 2;

      let w = targetPageWidth;
      let h = w / aspectRatio;

      if (h > availH) {
        h = availH;
        w = h * aspectRatio;
      }

      setDimensions({
        width: Math.max(160, Math.round(w * zoom)),
        height: Math.max(220, Math.round(h * zoom)),
      });
    }

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, [aspectRatio, isSinglePage, zoom]);

  // Render halaman-halaman PDF menjadi data URL gambar
  useEffect(() => {
    let cancelled = false;

    async function renderAllPages(): Promise<void> {
      try {
        setLoading(true);
        setError(null);
        setRenderedCount(0);

        const renderedList: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const dataUrl = await renderPageToImage(pdf, i, 2.0);
          renderedList.push(dataUrl);
          setRenderedCount(i);
        }

        if (!cancelled) {
          setPages(renderedList);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal merender halaman PDF:", err);
        if (!cancelled) {
          setError(dict.reader.errorLoading);
          setLoading(false);
        }
      }
    }

    renderAllPages();

    return () => {
      cancelled = true;
    };
  }, [pdf, dict.reader.errorLoading]);

  // Inisialisasi PageFlip saat pages dan dimensions siap
  useEffect(() => {
    if (!containerRef.current || pages.length === 0 || !dimensions) return;

    const parent = containerRef.current;
    // Bersihkan host sebelumnya
    parent.innerHTML = "";

    // Buat DOM host terisolasi untuk PageFlip agar tidak mengganggu React reconciliation
    const bookHost = document.createElement("div");
    bookHost.style.margin = "0 auto";
    parent.appendChild(bookHost);

    const isMobileScreen = window.innerWidth < 768;
    const usePortraitMode = isSinglePage || isMobileScreen;

    try {
      const flip = new PageFlip(bookHost, {
        width: dimensions.width,
        height: dimensions.height,
        size: "fixed",
        minWidth: 160,
        maxWidth: 1200,
        minHeight: 220,
        maxHeight: 1600,
        showCover: false,
        mobileScrollSupport: true,
        startPage: initialPage,
        drawShadow: true,
        flippingTime: 500,
        usePortrait: usePortraitMode,
        startZIndex: 0,
        autoSize: true,
        maxShadowOpacity: 0.25,
        showPageCorners: true,
        disableFlipByClick: false,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 20,
      });

      flip.loadFromImages(pages);

      flip.on("flip", (e) => {
        onPageChange?.(Number(e.data) + 1);
      });

      pageFlipInstance.current = flip;
    } catch (err) {
      console.error("Gagal menginisialisasi PageFlip:", err);
    }

    return () => {
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch {
          // Abaikan error saat teardown
        }
        pageFlipInstance.current = null;
      }
      parent.innerHTML = "";
    };
  }, [pages, dimensions, isSinglePage, initialPage, onPageChange]);

  const handlePrevPage = useCallback(() => {
    pageFlipInstance.current?.flipPrev("top");
  }, []);

  const handleNextPage = useCallback(() => {
    pageFlipInstance.current?.flipNext("top");
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg
            width="24"
            height="24"
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
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  const isMobileScreen =
    typeof window !== "undefined" ? window.innerWidth < 768 : true;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-auto px-2 py-4 sm:px-4">
      {/* Tap zones untuk mobile reader */}
      {isMobileScreen && !loading && (
        <>
          {/* Left tap zone: Flip to Previous Page */}
          <button
            type="button"
            className="absolute left-0 top-0 z-30 h-full w-1/5 opacity-0 cursor-pointer"
            onClick={handlePrevPage}
            aria-label={dict.reader.previousPage}
          />
          {/* Center tap zone: Toggle Toolbar Controls */}
          <button
            type="button"
            className="absolute left-1/5 top-0 z-20 h-full w-3/5 opacity-0 cursor-pointer"
            onClick={onToggleControls}
            aria-label="Toggle Menu"
          />
          {/* Right tap zone: Flip to Next Page */}
          <button
            type="button"
            className="absolute right-0 top-0 z-30 h-full w-1/5 opacity-0 cursor-pointer"
            onClick={handleNextPage}
            aria-label={dict.reader.nextPage}
          />
        </>
      )}

      {/* Flipbook DOM Container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center shadow-2xl transition-transform duration-200"
      />

      {/* Loading Progress Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            {dict.reader.loadingPdf} ({renderedCount}/{pdf.numPages})
          </p>
        </div>
      )}
    </div>
  );
}
