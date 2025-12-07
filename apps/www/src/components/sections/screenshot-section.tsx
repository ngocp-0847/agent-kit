"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef, useState, useEffect } from "react";

const TERMINAL_LINES = [
  { type: "command", content: "npx cursor-kit-cli init" },
  { type: "prompt", question: "Select target:", answer: "Cursor IDE" },
  { type: "prompt", question: "Select commands to install:", answer: "All (7 commands)" },
  { type: "prompt", question: "Select rules to install:", answer: "All (3 rules)" },
  { type: "prompt", question: "Select skills to install:", answer: "All (8 skills)" },
  { type: "success", content: "✓ Created .cursor/commands/ (7 files)" },
  { type: "success", content: "✓ Created .cursor/rules/ (3 files)" },
  { type: "success", content: "✓ Created .cursor/skills/ (8 directories)" },
  { type: "complete", content: "✓ Setup complete!" },
] as const;

const LINE_DELAYS = [0, 0.4, 0.7, 1.0, 1.3, 1.8, 2.1, 2.4, 2.8];

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  },
};

const cursorVariants: Variants = {
  blink: {
    opacity: [1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

export function ScreenshotSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [currentLine, setCurrentLine] = useState(-1);

  useEffect(() => {
    if (!isInView) return;

    const timeouts = LINE_DELAYS.map((delay, index) =>
      setTimeout(() => setCurrentLine(index), delay * 1000)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section className="border-b border-border/50 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, powerful CLI
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            One command to initialize your entire AI development environment.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/10"
        >
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
            <div className="flex gap-2">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
            </div>
            <span className="ml-4 text-sm text-muted-foreground font-mono">
              terminal
            </span>
          </div>

          <div className="p-6 font-mono text-sm min-h-[280px]">
            <div className="flex flex-col gap-1">
              {TERMINAL_LINES.map((line, index) => (
                <TerminalLine
                  key={index}
                  line={line}
                  index={index}
                  currentLine={currentLine}
                  totalLines={TERMINAL_LINES.length}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Get up and running in less than 30 seconds
        </p>
      </div>
    </section>
  );
}

interface TerminalLineProps {
  line: (typeof TERMINAL_LINES)[number];
  index: number;
  currentLine: number;
  totalLines: number;
}

function TerminalLine({ line, index, currentLine, totalLines }: TerminalLineProps) {
  const isVisible = index <= currentLine;
  const showCursor = index === currentLine && currentLine < totalLines - 1;

  if (line.type === "command") {
    return (
      <motion.div
        className="flex items-center gap-2"
        variants={lineVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <span className="text-muted-foreground">$</span>
        <span className="text-foreground">{line.content}</span>
        {showCursor && <BlinkingCursor />}
      </motion.div>
    );
  }

  if (line.type === "prompt") {
    return (
      <motion.p
        className="text-muted-foreground pl-4"
        variants={lineVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        ? {line.question} <span className="text-foreground">{line.answer}</span>
        {showCursor && <BlinkingCursor />}
      </motion.p>
    );
  }

  if (line.type === "success") {
    return (
      <motion.p
        className="text-green-600 dark:text-green-400 pl-4"
        variants={lineVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {line.content}
        {showCursor && <BlinkingCursor />}
      </motion.p>
    );
  }

  if (line.type === "complete") {
    return (
      <motion.p
        className="text-green-600 dark:text-green-400 font-medium pl-4 mt-2"
        variants={lineVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {line.content}
      </motion.p>
    );
  }

  return null;
}

function BlinkingCursor() {
  return (
    <motion.span
      className="inline-block w-2 h-4 bg-foreground/80 ml-1"
      variants={cursorVariants}
      animate="blink"
    />
  );
}
