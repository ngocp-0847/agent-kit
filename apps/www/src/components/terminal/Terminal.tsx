import type { Component, JSX } from "solid-js";
import { splitProps, For, Show, createMemo } from "solid-js";

export interface TerminalLineProps {
  content: string;
  isCommand?: boolean;
  delay?: number;
}

const highlightLine = (line: string): JSX.Element => {
  if (line.startsWith("$")) {
    const parts = line.split(" ");
    return (
      <>
        <span class="text-[var(--terminal-green)]">{parts[0]}</span>
        <span class="text-[var(--terminal-cyan)]"> {parts[1]}</span>
        <span class="text-[var(--text-secondary)]"> {parts.slice(2).join(" ")}</span>
      </>
    );
  }

  if (line.startsWith("✓") || line.startsWith("✨")) {
    return <span class="text-[var(--terminal-green)]">{line}</span>;
  }

  if (line.startsWith("→")) {
    return <span class="text-[var(--terminal-cyan)]">{line}</span>;
  }

  if (line.startsWith("?")) {
    return <span class="text-[var(--terminal-yellow)]">{line}</span>;
  }

  if (line.startsWith("✦")) {
    return <span class="text-[var(--terminal-purple)]">{line}</span>;
  }

  if (line.includes("◉") || line.includes("•")) {
    return <span class="text-[var(--text-secondary)]">{line}</span>;
  }

  if (line.startsWith("📜") || line.startsWith("📋") || line.startsWith("🎓") || 
      line.startsWith("📍") || line.startsWith("📁") || line.startsWith("📝")) {
    return <span class="text-[var(--text-primary)]">{line}</span>;
  }

  return <span class="text-[var(--text-secondary)]">{line}</span>;
};

export const TerminalLine: Component<TerminalLineProps> = (props) => {
  const [local] = splitProps(props, ["content", "isCommand", "delay"]);

  const highlighted = createMemo(() => highlightLine(local.content));

  return (
    <div
      class="font-mono text-sm leading-relaxed whitespace-pre"
      style={local.delay ? { "animation-delay": `${local.delay}ms` } : undefined}
    >
      {highlighted()}
    </div>
  );
};

export interface TerminalProps {
  title?: string;
  lines: string[];
  animated?: boolean;
  class?: string;
}

export const Terminal: Component<TerminalProps> = (props) => {
  const [local] = splitProps(props, ["title", "lines", "animated", "class"]);

  return (
    <div class={`rounded-xl overflow-hidden border border-[var(--border-primary)] shadow-2xl ${local.class ?? ""}`}>
      {/* Terminal Header */}
      <div class="bg-[var(--terminal-header)] px-4 py-3 flex items-center gap-3">
        <div class="flex gap-2">
          <div class="w-3 h-3 rounded-full bg-[var(--terminal-red)]" />
          <div class="w-3 h-3 rounded-full bg-[var(--terminal-yellow)]" />
          <div class="w-3 h-3 rounded-full bg-[var(--terminal-green)]" />
        </div>
        <Show when={local.title}>
          <span class="text-[var(--text-muted)] text-sm font-mono ml-2">{local.title}</span>
        </Show>
      </div>

      {/* Terminal Body */}
      <div class="bg-[var(--terminal-bg)] p-5 min-h-[200px] max-h-[400px] overflow-y-auto">
        <div class="space-y-0.5">
          <For each={local.lines}>
            {(line, index) => (
              <TerminalLine
                content={line}
                isCommand={line.startsWith("$")}
                delay={local.animated ? index() * 50 : 0}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
