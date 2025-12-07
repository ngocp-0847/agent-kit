import type { Component } from "solid-js";
import { For } from "solid-js";
import { A } from "@solidjs/router";
import { Button, Badge } from "../ui";
import { FadeIn } from "../animations";
import { commands } from "../../data/commands";

export const CommandsSection: Component = () => {
  return (
    <section class="py-24">
      <div class="max-w-6xl mx-auto px-6">
        {/* Header */}
        <FadeIn direction="up">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Powerful CLI Commands
            </h2>
            <p class="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Simple yet powerful commands to manage your AI configurations.
              Explore each command in our interactive playground.
            </p>
          </div>
        </FadeIn>

        {/* Commands List */}
        <div class="space-y-4 mb-12">
          <For each={commands}>
            {(command, index) => (
              <FadeIn direction="left" delay={index() * 75}>
                <div class="group p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--border-hover)] transition-all duration-300">
                  <div class="flex flex-col md:flex-row md:items-center gap-4">
                    <div class="flex-1 space-y-2">
                      <div class="flex items-center gap-3">
                        <code class="text-lg font-mono text-[var(--terminal-cyan)] font-semibold">
                          {command.name}
                        </code>
                        {command.id === "instance" && (
                          <Badge variant="warning">macOS</Badge>
                        )}
                      </div>
                      <p class="text-[var(--text-secondary)]">
                        {command.description}
                      </p>
                    </div>
                    <A
                      href={`/playground?cmd=${command.id}`}
                      class="shrink-0"
                    >
                      <Button variant="ghost" size="sm">
                        Try it →
                      </Button>
                    </A>
                  </div>
                </div>
              </FadeIn>
            )}
          </For>
        </div>

        {/* CTA */}
        <FadeIn direction="up" delay={commands.length * 75 + 100}>
          <div class="text-center">
            <A href="/playground">
              <Button size="lg">
                Open CLI Playground
                <span>→</span>
              </Button>
            </A>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
