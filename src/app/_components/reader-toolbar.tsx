"use client";

import type { Dictionary } from "@/lib/dictionaries";

interface ReaderToolbarProps {
  dict: Dictionary;
  title?: string;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isSinglePage: boolean;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onToggleViewMode: () => void;
  isFullscreen: boolean;
  onBack: () => void;
  visible: boolean;
}

export function ReaderToolbar({
  dict,
  title,
  currentPage,
  totalPages,
  zoom,
  isSinglePage,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleViewMode,
  isFullscreen,
  onBack,
  visible,
}: ReaderToolbarProps) {
  const pageText = dict.reader.pageOf
    .replace("{current}", String(currentPage))
    .replace("{total}", String(totalPages));

  return (
    <>
      {/* Top Header Toolbar */}
      <header
        className={`
          fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ease-out
          ${visible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur-md sm:px-6">
          {/* Left: Back button + Document Title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={dict.reader.backToHome}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">{dict.reader.backToHome}</span>
            </button>

            {title && (
              <span className="truncate text-xs font-semibold text-foreground/80 sm:max-w-xs sm:text-sm md:max-w-md">
                {title}
              </span>
            )}
          </div>

          {/* Right: View Mode Toggle + Zoom + Fullscreen */}
          <div className="flex items-center gap-1">
            {/* View Mode Toggle (1 Page vs 2 Pages) */}
            <button
              type="button"
              onClick={onToggleViewMode}
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-surface px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
              title={dict.reader.toggleView}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {isSinglePage ? (
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                ) : (
                  <>
                    <rect x="2" y="3" width="9" height="18" rx="2" />
                    <rect x="13" y="3" width="9" height="18" rx="2" />
                  </>
                )}
              </svg>
              <span>{isSinglePage ? dict.reader.singlePage : dict.reader.doublePage}</span>
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={dict.reader.zoomOut}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <span className="min-w-[2.75rem] text-center text-xs font-semibold tabular-nums text-foreground/80">
              {Math.round(zoom * 100)}%
            </span>

            {/* Zoom In */}
            <button
              type="button"
              onClick={onZoomIn}
              disabled={zoom >= 3}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={dict.reader.zoomIn}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <div className="mx-1 h-4 w-px bg-border/80" />

            {/* Fullscreen */}
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={
                isFullscreen
                  ? dict.reader.exitFullscreen
                  : dict.reader.fullscreen
              }
            >
              {isFullscreen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation Bar (Mobile & Desktop) */}
      <footer
        className={`
          fixed bottom-3 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out
          ${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}
        `}
      >
        <nav
          aria-label="Navigasi Halaman"
          className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-lg sm:gap-3 sm:px-4 sm:py-2"
        >
          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={dict.reader.previousPage}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Slider */}
          <input
            type="range"
            min={1}
            max={Math.max(1, totalPages)}
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="h-1.5 w-24 cursor-pointer accent-primary sm:w-36 md:w-48"
            aria-label={dict.reader.goToPage}
          />

          {/* Page Badge */}
          <span className="min-w-[4.5rem] select-none text-center text-xs font-semibold tabular-nums text-foreground">
            {pageText}
          </span>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={dict.reader.nextPage}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </nav>
      </footer>
    </>
  );
}
