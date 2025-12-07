import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:from-indigo-400 hover:to-cyan-300 shadow-lg shadow-indigo-500/25",
  secondary:
    "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-primary)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]",
  outline:
    "bg-transparent border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-overlay)]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3 text-lg",
};

export const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "children"]);

  const variant = () => local.variant ?? "primary";
  const size = () => local.size ?? "md";

  return (
    <button
      class={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant()]}
        ${sizeStyles[size()]}
        ${local.class ?? ""}
      `}
      {...rest}
    >
      {local.children}
    </button>
  );
};
