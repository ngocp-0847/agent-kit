import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)]",
  primary: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  info: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export const Badge: ParentComponent<BadgeProps> = (props) => {
  const [local, rest] = splitProps(props, ["variant", "class", "children"]);

  const variant = () => local.variant ?? "default";

  return (
    <span
      class={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        border
        ${variantStyles[variant()]}
        ${local.class ?? ""}
      `}
      {...rest}
    >
      {local.children}
    </span>
  );
};
