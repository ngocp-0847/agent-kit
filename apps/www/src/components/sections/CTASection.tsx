import type { Component } from "solid-js";
import { Button } from "../ui";
import { FadeIn } from "../animations";

export const CTASection: Component = () => {
  return (
    <section class="py-24 relative overflow-hidden">
      {/* Background */}
      <div class="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative max-w-4xl mx-auto px-6 text-center">
        <FadeIn direction="up">
          <div class="space-y-8">
            <h2 class="text-3xl lg:text-5xl font-bold text-[var(--text-primary)]">
              Ready to supercharge your{" "}
              <span class="text-gradient">AI coding workflow</span>?
            </h2>

            <p class="text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Join developers who are already using cursor-kit to boost their productivity
              with curated rules, commands, and skills.
            </p>

            <div class="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/duongductrong/cursor-kit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Star on GitHub
                </Button>
              </a>
              <a
                href="https://www.npmjs.com/package/cursor-kit-cli"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                  </svg>
                  View on NPM
                </Button>
              </a>
            </div>

            {/* Stats/Social proof placeholder */}
            <div class="pt-8 flex flex-wrap justify-center gap-8 text-sm text-[var(--text-muted)]">
              <div class="flex items-center gap-2">
                <span class="text-[var(--text-primary)] font-semibold">MIT</span>
                <span>Licensed</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[var(--text-primary)] font-semibold">7+</span>
                <span>Commands</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[var(--text-primary)] font-semibold">8+</span>
                <span>Skills</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
