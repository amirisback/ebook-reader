"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries";
import {
  getRecentDocuments,
  removeRecentDocument,
  type RecentDocument,
} from "@/lib/storage";

interface RecentDocumentsProps {
  dict: Dictionary;
  onDocumentSelect: (doc: RecentDocument) => void;
}

export function RecentDocuments({
  dict,
  onDocumentSelect,
}: RecentDocumentsProps) {
  const [docs, setDocs] = useState<RecentDocument[]>(() => getRecentDocuments());

  const handleRemove = (id: string) => {
    removeRecentDocument(id);
    setDocs(getRecentDocuments());
  };

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">{dict.home.recentEmpty}</p>
      </div>
    );
  }

  return (
    <div className="stagger-children grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="group relative flex gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
        >
          {/* Thumbnail */}
          <button
            type="button"
            onClick={() => onDocumentSelect(doc)}
            className="flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-secondary"
            aria-label={`${dict.home.recentContinue}: ${doc.title}`}
          >
            {doc.thumbnail ? (
              <Image
                src={doc.thumbnail}
                alt={doc.title}
                width={56}
                height={72}
                className="h-[72px] w-[56px] object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-[72px] w-[56px] items-center justify-center text-muted-foreground">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            )}
          </button>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <button
              type="button"
              onClick={() => onDocumentSelect(doc)}
              className="cursor-pointer text-left"
            >
              <p className="truncate text-sm font-medium text-card-foreground">
                {doc.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {dict.home.recentPages.replace(
                  "{count}",
                  String(doc.pageCount)
                )}
              </p>
            </button>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground/70">
                {dict.home.recentLastRead.replace(
                  "{date}",
                  new Date(doc.lastRead).toLocaleDateString()
                )}
              </p>
              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="rounded p-1 text-muted-foreground/50 opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                aria-label={`${dict.home.recentDelete}: ${doc.title}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
