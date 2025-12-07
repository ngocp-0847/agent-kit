import type { Component } from "solid-js";
import { useTypewriter } from "../../hooks";

export interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  class?: string;
  onComplete?: () => void;
}

export const TypewriterEffect: Component<TypewriterEffectProps> = (props) => {
  const displayText = useTypewriter({
    text: props.text,
    speed: props.speed ?? 50,
    delay: props.delay ?? 0,
    onComplete: props.onComplete,
  });

  return (
    <span class={props.class}>
      {displayText()}
      {props.showCursor !== false && <span class="cursor-blink" />}
    </span>
  );
};
