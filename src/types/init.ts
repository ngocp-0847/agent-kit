export type InstructionTarget = "cursor" | "github-copilot" | "google-antigravity" | "kiro";

export interface TargetConfig {
  label: string;
  description: string;
  rootDir: (cwd: string) => string;
  outputFile?: (cwd: string) => string;
}

export interface PowerSelectionArgs {
  all?: boolean;
  commands?: boolean;
  rules?: boolean;
  skills?: boolean;
  mcp?: boolean;
  powers?: boolean;
  force?: boolean;
}
