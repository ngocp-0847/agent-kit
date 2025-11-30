import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_RAW_URL, TEMPLATE_PATHS } from "./constants";
import { fileExists, readFile, dirExists, listFiles } from "./fs";

export interface TemplateManifest {
  commands: string[];
  rules: string[];
}

export type TemplateType = "commands" | "rules";

export interface TemplateItem {
  name: string;
  type: TemplateType;
}

function getLocalTemplatesDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  // From dist/ go up one level to package root, then into templates/
  return join(currentDir, "..", "templates");
}

function getLocalManifest(): TemplateManifest | null {
  const templatesDir = getLocalTemplatesDir();
  const manifestPath = join(templatesDir, "manifest.json");

  if (fileExists(manifestPath)) {
    try {
      return JSON.parse(readFile(manifestPath)) as TemplateManifest;
    } catch {
      return null;
    }
  }

  const commandsDir = join(templatesDir, "commands");
  const rulesDir = join(templatesDir, "rules");

  if (!dirExists(commandsDir) && !dirExists(rulesDir)) {
    return null;
  }

  return {
    commands: dirExists(commandsDir) ? listFiles(commandsDir, ".md") : [],
    rules: dirExists(rulesDir) ? listFiles(rulesDir, ".mdc") : [],
  };
}

function getLocalTemplateContent(type: TemplateType, filename: string): string | null {
  const templatesDir = getLocalTemplatesDir();
  const filePath = join(templatesDir, type, filename);

  if (fileExists(filePath)) {
    return readFile(filePath);
  }

  return null;
}

export async function fetchTemplateManifest(): Promise<TemplateManifest> {
  const localManifest = getLocalManifest();
  if (localManifest) {
    return localManifest;
  }

  const url = `${REPO_RAW_URL}/templates/manifest.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch template manifest: ${response.statusText}`);
  }

  return response.json() as Promise<TemplateManifest>;
}

export async function fetchTemplateContent(
  type: TemplateType,
  filename: string
): Promise<string> {
  const localContent = getLocalTemplateContent(type, filename);
  if (localContent !== null) {
    return localContent;
  }

  const templatePath = TEMPLATE_PATHS[type];
  const url = `${REPO_RAW_URL}/${templatePath}/${filename}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch template ${filename}: ${response.statusText}`);
  }

  return response.text();
}

export async function fetchMultipleTemplates(
  type: TemplateType,
  filenames: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  const fetchPromises = filenames.map(async (filename) => {
    const content = await fetchTemplateContent(type, filename);
    return { filename, content };
  });

  const settled = await Promise.allSettled(fetchPromises);

  for (const result of settled) {
    if (result.status === "fulfilled") {
      results.set(result.value.filename, result.value.content);
    }
  }

  return results;
}

export function getTemplateLabel(filename: string): string {
  const nameWithoutExt = filename.replace(/\.(md|mdc)$/, "");
  return nameWithoutExt
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

