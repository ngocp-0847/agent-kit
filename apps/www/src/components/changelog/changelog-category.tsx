import { ChangelogCommit } from "./changelog-commit";
import type { ChangelogCategory as CategoryType } from "@/lib/changelog";

interface ChangelogCategoryProps {
  category: CategoryType;
}

export function ChangelogCategory({ category }: ChangelogCategoryProps) {
  return (
    <div className="mt-4 first:mt-0">
      <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span>{category.emoji}</span>
        <span>{category.title}</span>
        <span className="text-xs text-muted-foreground">
          ({category.commits.length})
        </span>
      </h4>
      <ul className="mt-2 space-y-0.5 border-l border-border pl-4 ml-1">
        {category.commits.map((commit) => (
          <ChangelogCommit key={commit.hash} commit={commit} />
        ))}
      </ul>
    </div>
  );
}
