import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-xl border border-border/30 bg-secondary/30 p-6",
        "transition-colors duration-200 ease-out",
        "hover:border-border/50 hover:bg-secondary/50",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg gradient-bg-subtle">
        <Icon className="size-5 text-[var(--gradient-mid)]" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
