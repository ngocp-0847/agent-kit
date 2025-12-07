import Link from "next/link";
import type { ChangelogCommit as CommitType } from "@/lib/changelog";

interface ChangelogCommitProps {
  commit: CommitType;
}

export function ChangelogCommit({ commit }: ChangelogCommitProps) {
  return (
    <li className="group flex items-start gap-3 py-2">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40 group-hover:bg-[var(--gradient-mid)] transition-colors" />
      <div className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm text-foreground/90">{commit.message}</span>
        <Link
          href={commit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
        >
          {commit.hash}
        </Link>
      </div>
    </li>
  );
}
