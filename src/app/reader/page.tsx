import type { Metadata } from "next";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { generatePageSeo } from "@/lib/seo";
import { ReaderClient } from "./reader-client";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getCurrentDictionary();

  return generatePageSeo({
    title: dict.reader.title,
    description: dict.metadata.description,
    locale,
    pathname: "/reader",
  });
}

import { Suspense } from "react";

export default async function ReaderPage() {
  const { dict } = await getCurrentDictionary();

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-reader-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ReaderClient dict={dict} />
    </Suspense>
  );
}
