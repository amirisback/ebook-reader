"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/dictionaries";
import { savePdfToDB } from "@/lib/pdf-db";
import { saveRecentDocument, type RecentDocument } from "@/lib/storage";
import { UploadZone } from "./upload-zone";
import { RecentDocuments } from "./recent-documents";

interface HomeClientProps {
  dict: Dictionary;
}

/**
 * Bagian interaktif Home page — menangani upload PDF dan navigasi ke reader.
 * Menggunakan IndexedDB untuk persistensi lokal dan Flat Routing + SearchParams (/reader?id=...).
 */
export function HomeClient({ dict }: HomeClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const navigateToReader = useCallback(
    async (file: File) => {
      try {
        setIsProcessing(true);

        const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        // Simpan binary PDF ke IndexedDB
        await savePdfToDB(docId, file);

        // Simpan metadata awal ke localStorage
        const baseTitle = file.name.replace(/\.pdf$/i, "");
        saveRecentDocument({
          id: docId,
          title: baseTitle,
          pageCount: 1,
          lastPage: 0,
          thumbnail: "",
        });

        // Fallback session
        const blobUrl = URL.createObjectURL(file);
        sessionStorage.setItem("docuflip_pdf_url", blobUrl);
        sessionStorage.setItem("docuflip_pdf_name", file.name);
        sessionStorage.setItem("docuflip_pdf_id", docId);

        // Navigasi instan ke reader
        router.push(`/reader?id=${docId}`);
      } catch (err) {
        console.error("Gagal memproses PDF:", err);
        setIsProcessing(false);
      }
    },
    [router]
  );

  const handleDocumentSelect = useCallback(
    (doc: RecentDocument) => {
      router.push(`/reader?id=${doc.id}`);
    },
    [router]
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      {/* Upload Section */}
      <section className="animate-fade-in">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {dict.home.uploadTitle}
        </h2>
        <UploadZone
          dict={dict}
          onFileAccepted={navigateToReader}
          isProcessing={isProcessing}
        />
      </section>

      {/* Recent Documents */}
      <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {dict.home.recentTitle}
        </h2>
        <RecentDocuments dict={dict} onDocumentSelect={handleDocumentSelect} />
      </section>
    </div>
  );
}
