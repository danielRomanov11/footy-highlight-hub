import Link from "next/link";
import { ArrowRight, Play, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export async function HomeHero() {
  const { t } = await getTranslations();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      <div
        className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-card to-background"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 48px, oklch(1 0 0 / 4%) 48px, oklch(1 0 0 / 4%) 49px)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 px-6 py-10 sm:px-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Play className="h-3.5 w-3.5" aria-hidden />
            {t.hero.badge}
          </div>
          <h1 className="text-4xl font-bold uppercase leading-none sm:text-5xl lg:text-6xl">
            {t.hero.titleLine1}
            <span className="block text-primary">{t.hero.titleLine2}</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">{t.hero.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href="/browse" className={cn(buttonVariants({ size: "lg" }), "cursor-pointer gap-2")}>
            {t.hero.browseCompetitions}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/sources"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "cursor-pointer gap-2 border-border/80 bg-background/40 backdrop-blur-sm",
            )}
          >
            <Trophy className="h-4 w-4" aria-hidden />
            {t.hero.trustedSources}
          </Link>
        </div>
      </div>
    </section>
  );
}
