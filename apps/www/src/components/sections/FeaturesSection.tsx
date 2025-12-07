import type { Component } from "solid-js";
import { For } from "solid-js";
import { Card, CardContent } from "../ui";
import { FadeIn } from "../animations";
import { features } from "../../data/commands";

export const FeaturesSection: Component = () => {
  return (
    <section class="py-24">
      <div class="max-w-6xl mx-auto px-6">
        {/* Header */}
        <FadeIn direction="up">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything you need to{" "}
              <span class="text-gradient">supercharge your AI IDE</span>
            </h2>
            <p class="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              cursor-kit provides a complete toolkit for managing your AI coding assistant
              configurations with ease.
            </p>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={features}>
            {(feature, index) => (
              <FadeIn direction="up" delay={index() * 100}>
                <Card hover class="h-full">
                  <CardContent class="space-y-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                      {feature.icon}
                    </div>
                    <h3 class="text-xl font-semibold text-[var(--text-primary)]">
                      {feature.title}
                    </h3>
                    <p class="text-[var(--text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};
