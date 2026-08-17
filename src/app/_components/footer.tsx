import type { Dictionary } from "@/lib/dictionaries";

interface FooterProps {
  dict: Dictionary;
}

export function Footer({ dict }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <p className="text-sm text-muted-foreground">
          {dict.footer.copyright.replace("{year}", String(year))}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {dict.footer.tagline}
        </p>
      </div>
    </footer>
  );
}
