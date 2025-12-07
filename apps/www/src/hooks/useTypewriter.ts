import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export function useTypewriter(options: UseTypewriterOptions): Accessor<string> {
  const { text, speed = 50, delay = 0, onComplete } = options;
  const [displayText, setDisplayText] = createSignal("");

  createEffect(() => {
    let currentIndex = 0;
    let timeoutId: number;
    let intervalId: number;

    const startTyping = () => {
      intervalId = window.setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          onComplete?.();
        }
      }, speed);
    };

    if (delay > 0) {
      timeoutId = window.setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    onCleanup(() => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    });
  });

  return displayText;
}
