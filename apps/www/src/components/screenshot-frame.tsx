import { cn } from "@/lib/utils";
import Image from "next/image";

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ScreenshotFrame({
  src,
  alt,
  caption,
  className,
  width = 1200,
  height = 800,
}: ScreenshotFrameProps) {
  return (
    <figure className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-border bg-card",
          "shadow-lg shadow-black/5",
          "ring-1 ring-black/5"
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          priority
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-muted-foreground text-center max-w-lg">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
