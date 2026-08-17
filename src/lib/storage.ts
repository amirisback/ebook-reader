/**
 * LocalStorage helper untuk riwayat dokumen yang baru dibaca.
 * Client-side only — jangan import di Server Component.
 */

import { deletePdfFromDB } from "./pdf-db";

const STORAGE_KEY = "docuflip_recent_docs";
const MAX_RECENT = 10;

export interface RecentDocument {
  /** Unique ID (nanoid-style, dari timestamp) */
  id: string;
  /** Nama file asli */
  title: string;
  /** Jumlah halaman total */
  pageCount: number;
  /** Halaman terakhir yang dibaca (0-indexed) */
  lastPage: number;
  /** Base64 data URL thumbnail halaman pertama */
  thumbnail: string;
  /** ISO timestamp kapan terakhir dibaca */
  lastRead: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getRecentDocuments(): RecentDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const docs: RecentDocument[] = JSON.parse(raw);
    return docs.sort(
      (a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
    );
  } catch {
    return [];
  }
}

export function saveRecentDocument(
  doc: Omit<RecentDocument, "id" | "lastRead"> & { id?: string }
): RecentDocument {
  const docs = getRecentDocuments();
  const existingIndex = doc.id
    ? docs.findIndex((d) => d.id === doc.id)
    : -1;

  const saved: RecentDocument = {
    id: doc.id ?? generateId(),
    title: doc.title,
    pageCount: doc.pageCount,
    lastPage: doc.lastPage,
    thumbnail: doc.thumbnail,
    lastRead: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    docs[existingIndex] = saved;
  } else {
    docs.unshift(saved);
  }

  // Potong ke max jumlah
  const trimmed = docs.slice(0, MAX_RECENT);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage penuh — hapus yang paling lama
    trimmed.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("docuflip_storage_change"));
  }

  return saved;
}

export function removeRecentDocument(id: string): void {
  try {
    const docs = getRecentDocuments().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.warn("Gagal memperbarui localStorage setelah hapus:", err);
  }
  deletePdfFromDB(id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("docuflip_storage_change"));
  }
}
