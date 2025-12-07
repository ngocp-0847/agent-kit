import type { ParentComponent } from "solid-js";
import { splitProps } from "solid-js";
import { useIntersectionObserver } from "../../hooks";

export interface FadeInProps {
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  class?: string;
}

const directionStyles = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
};

export const FadeIn: ParentComponent<FadeInProps> = (props) => {
  const [local, rest] = splitProps(props, ["direction", "delay", "duration", "class", "children"]);

  const direction = () => local.direction ?? "up";
  const delay = () => local.delay ?? 0;
  const duration = () => local.duration ?? 600;

  const [isVisible, setRef] = useIntersectionObserver({ threshold: 0.1, once: true });

  return (
    <div
      ref={setRef}
      class={`transition-all ease-out ${local.class ?? ""}`}
      style={{
        opacity: isVisible() ? 1 : 0,
        transform: isVisible() ? "translate(0, 0)" : undefined,
        "transition-delay": `${delay()}ms`,
        "transition-duration": `${duration()}ms`,
      }}
      classList={{
        [directionStyles[direction()]]: !isVisible(),
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
};
