import Link from "next/link";
import { ChangelogCategory } from "./changelog-category";
import type { ChangelogEntry as EntryType } from "@/lib/changelog";

interface ChangelogEntryProps {
  entry: EntryType;
  isLatest?: boolean;
}

export function ChangelogEntry({ entry, isLatest }: ChangelogEntryProps) {
  return (
    <article className="relative pl-8 pb-12 last:pb-0">
      {/* Timeline line */}
      <div
        className="absolute left-[7px] top-3 -bottom-3 w-px bg-border last:hidden"
        aria-hidden="true"
      />

      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1.5 size-4 rounded-full border-2 ${
          isLatest
            ? "gradient-bg border-transparent"
            : "border-border bg-background"
        }`}
        aria-hidden="true"
      />

      {/* Entry header */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Link
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-all hover:scale-105 ${
            isLatest
              ? "gradient-bg text-white"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          v{entry.version}
        </Link>
        <time
          dateTime={entry.date}
          className="text-sm text-muted-foreground"
        >
          {new Date(entry.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {isLatest && (
          <span className="rounded-full border border-[var(--gradient-mid)] px-2 py-0.5 text-xs text-[var(--gradient-mid)]">
            Latest
          </span>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {entry.categories.map((category) => (
          <ChangelogCategory
            key={`${entry.version}-${category.title}`}
            category={category}
          />
        ))}
      </div>
    </article>
  );
}
