import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient blob accent */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-blob opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-32 text-center md:py-40">
        <div className="flex flex-col items-center gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full gradient-bg" />
            Supercharge your AI IDE with rules & commands
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Manage, share, and sync your{" "}
            <span className="gradient-text">AI IDE configurations</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            A CLI toolkit for Cursor IDE and GitHub Copilot. Commands, rules,
            and skills—all version-controlled and shareable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="https://www.npmjs.com/package/cursor-kit-cli" target="_blank">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link href="https://github.com/duongductrong/cursor-kit" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
