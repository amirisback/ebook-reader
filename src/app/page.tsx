import { getCurrentDictionary } from "@/lib/i18n-server";
import { generateWebsiteJsonLd } from "@/lib/seo";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { HomeClient } from "./_components/home-client";

export default async function Home() {
  const { locale, dict } = await getCurrentDictionary();
  const websiteJsonLd = generateWebsiteJsonLd(locale);

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* JSON-LD Structured Data — WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />

      <Header dict={dict} />

      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="mx-auto max-w-5xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-24">
            {/* Hero icon */}
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-16 sm:w-16">
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
                className="sm:h-8 sm:w-8"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>

            <h1 className="mx-auto max-w-lg text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {dict.home.title}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {dict.home.subtitle}
            </p>
          </div>

          {/* Subtle background gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        </section>

        {/* Client-side interactive area: Upload + Recent */}
        <HomeClient dict={dict} />
      </main>

      <Footer dict={dict} />
    </div>
  );
}
