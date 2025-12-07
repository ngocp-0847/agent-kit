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
        "group flex flex-col gap-4 rounded-xl border border-border bg-card p-6",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg gradient-bg-subtle">
        <Icon className="size-6 text-[var(--gradient-mid)]" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
