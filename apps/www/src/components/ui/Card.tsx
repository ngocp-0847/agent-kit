import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glow";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-[var(--bg-card)] border border-[var(--border-primary)]",
  elevated: "bg-[var(--surface-elevated)] border border-[var(--border-primary)] shadow-xl",
  glow: "bg-[var(--bg-card)] border border-[var(--border-primary)] glow-primary",
};

export const Card: ParentComponent<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ["variant", "hover", "class", "children"]);

  const variant = () => local.variant ?? "default";
  const hoverStyles = () =>
    local.hover
      ? "hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
      : "";

  return (
    <div
      class={`
        rounded-xl overflow-hidden
        ${variantStyles[variant()]}
        ${hoverStyles()}
        ${local.class ?? ""}
      `}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export const CardHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <div class={`p-6 pb-0 ${local.class ?? ""}`} {...rest}>
      {local.children}
    </div>
  );
};

export const CardContent: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <div class={`p-6 ${local.class ?? ""}`} {...rest}>
      {local.children}
    </div>
  );
};
