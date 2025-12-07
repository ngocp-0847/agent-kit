import type { Component } from "solid-js";
import { createSignal, createMemo, For, Show } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Button, Badge, Card, CardContent } from "../components/ui";
import { Terminal } from "../components/terminal";
import { FadeIn } from "../components/animations";
import { commands } from "../data/commands";

const PlaygroundPage: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCommand, setSelectedCommand] = createSignal(
    searchParams.cmd || "init"
  );

  const currentCommand = createMemo(
    () => commands.find((c) => c.id === selectedCommand()) ?? commands[0]
  );

  const handleSelectCommand = (commandId: string) => {
    setSelectedCommand(commandId);
    setSearchParams({ cmd: commandId });
  };

  return (
    <>
      <Title>CLI Playground - Cursor Kit</Title>
      <div class="min-h-screen py-12">
        <div class="max-w-7xl mx-auto px-6">
          {/* Header */}
          <FadeIn direction="up">
            <div class="text-center mb-12">
              <div class="inline-flex items-center gap-2 mb-4">
                <A
                  href="/"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ← Back to Home
                </A>
              </div>
              <h1 class="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
                CLI Playground
              </h1>
              <p class="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Explore cursor-kit commands interactively. Select a command to see its
                usage, options, and example output.
              </p>
            </div>
          </FadeIn>

          <div class="grid lg:grid-cols-12 gap-8">
            {/* Command Selector */}
            <div class="lg:col-span-3">
              <FadeIn direction="left" delay={100}>
                <div class="sticky top-24">
                  <h3 class="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                    Commands
                  </h3>
                  <div class="space-y-2">
                    <For each={commands}>
                      {(command) => (
                        <button
                          type="button"
                          onClick={() => handleSelectCommand(command.id)}
                          class={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                            selectedCommand() === command.id
                              ? "bg-indigo-500/20 border border-indigo-500/30 text-[var(--text-primary)]"
                              : "bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          <div class="flex items-center gap-2">
                            <code class="font-mono text-sm">{command.name}</code>
                            <Show when={command.id === "instance"}>
                              <Badge variant="warning" class="text-xs">macOS</Badge>
                            </Show>
                          </div>
                        </button>
                      )}
                    </For>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Main Content */}
            <div class="lg:col-span-9 space-y-8">
              {/* Command Details */}
              <FadeIn direction="up" delay={200}>
                <Card>
                  <CardContent class="space-y-6">
                    {/* Command header */}
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <h2 class="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                          <code class="font-mono">cursor-kit {currentCommand().name}</code>
                          <Show when={currentCommand().id === "instance"}>
                            <Badge variant="warning">macOS only</Badge>
                          </Show>
                        </h2>
                        <p class="mt-2 text-[var(--text-secondary)]">
                          {currentCommand().description}
                        </p>
                      </div>
                    </div>

                    {/* Usage */}
                    <div>
                      <h3 class="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                        Usage
                      </h3>
                      <div class="bg-[var(--terminal-bg)] rounded-lg p-4 overflow-x-auto">
                        <code class="font-mono text-sm">
                          <For each={currentCommand().usage}>
                            {(usage) => (
                              <div class="py-0.5">
                                <span class="text-[var(--terminal-cyan)]">
                                  {usage.split("#")[0]}
                                </span>
                                <Show when={usage.includes("#")}>
                                  <span class="text-[var(--text-muted)]">
                                    #{usage.split("#")[1]}
                                  </span>
                                </Show>
                              </div>
                            )}
                          </For>
                        </code>
                      </div>
                    </div>

                    {/* Options */}
                    <Show when={currentCommand().options && currentCommand().options!.length > 0}>
                      <div>
                        <h3 class="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                          Options
                        </h3>
                        <div class="grid gap-2">
                          <For each={currentCommand().options}>
                            {(option) => (
                              <div class="flex gap-4 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                                <code class="font-mono text-sm text-[var(--terminal-purple)] shrink-0 min-w-[200px]">
                                  {option.flag}
                                </code>
                                <span class="text-[var(--text-secondary)] text-sm">
                                  {option.description}
                                </span>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Terminal Output */}
              <FadeIn direction="up" delay={300}>
                <div>
                  <h3 class="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                    Example Output
                  </h3>
                  <Terminal
                    title={`cursor-kit ${currentCommand().name}`}
                    lines={currentCommand().output}
                    class="glow-primary"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaygroundPage;
