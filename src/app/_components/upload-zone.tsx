"use client";

import { useCallback, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadZoneProps {
  dict: Dictionary;
  onFileAccepted: (file: File) => void;
  isProcessing?: boolean;
}

export function UploadZone({ dict, onFileAccepted, isProcessing = false }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndAccept = useCallback(
    (file: File) => {
      setError(null);

      // Cek ekstensi atau mime type
      const isPdf =
        file.type === "application/pdf" ||
        file.type === "application/x-pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        setError(dict.upload.invalidType);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(dict.upload.tooLarge);
        return;
      }

      onFileAccepted(file);
    },
    [dict, onFileAccepted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (isProcessing) return;
      const file = e.dataTransfer.files[0];
      if (file) validateAndAccept(file);
    },
    [validateAndAccept, isProcessing]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isProcessing) setIsDragOver(true);
    },
    [isProcessing]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndAccept(file);
      // Reset agar bisa memilih file yang sama lagi
      e.target.value = "";
    },
    [validateAndAccept]
  );

  return (
    <div className="w-full">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          group relative flex w-full cursor-pointer flex-col items-center justify-center
          gap-4 rounded-xl border-2 border-dashed px-6 py-12
          transition-all duration-200
          focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring
          sm:py-16
          ${
            isProcessing
              ? "cursor-wait border-primary/50 bg-accent/20 opacity-80"
              : isDragOver
              ? "animate-drop-pulse border-primary bg-accent/50 scale-[1.01]"
              : "border-border bg-surface hover:border-primary/50 hover:bg-accent/30"
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            flex h-14 w-14 items-center justify-center rounded-full
            transition-all duration-200
            ${
              isProcessing
                ? "bg-primary text-primary-foreground"
                : isDragOver
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            }
          `}
        >
          {isProcessing ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-sm font-medium text-foreground">
            {isProcessing
              ? dict.upload.parsing
              : isDragOver
              ? dict.upload.dragActive
              : dict.home.uploadDesc}
          </p>
          <p className="text-xs text-muted-foreground">
            {dict.home.uploadHint}
          </p>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          accept=".pdf,application/pdf,application/x-pdf"
          disabled={isProcessing}
          onChange={handleInputChange}
          className="sr-only"
        />
      </label>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
