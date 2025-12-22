import figlet from "figlet";
import gradient from "gradient-string";
import pc from "picocolors";

const cursorGradient = gradient(["#00DC82", "#36E4DA", "#0047E1"]);

export function printBanner(): void {
  const banner = figlet.textSync("Agent Kit", {
    font: "ANSI Shadow",
    horizontalLayout: "fitted",
  });

  console.log(cursorGradient.multiline(banner));
  console.log();
  console.log(
    pc.dim("  ") +
      pc.bold(pc.cyan("✦")) +
      pc.dim(" Supercharge your AI coding agents with rules & commands"),
  );
  console.log();
}

export function printSuccess(message: string): void {
  console.log(pc.green("✓") + pc.dim(" ") + message);
}

export function printError(message: string): void {
  console.log(pc.red("✗") + pc.dim(" ") + message);
}

export function printInfo(message: string): void {
  console.log(pc.cyan("ℹ") + pc.dim(" ") + message);
}

export function printWarning(message: string): void {
  console.log(pc.yellow("⚠") + pc.dim(" ") + message);
}

export function printDivider(): void {
  console.log(pc.dim("─".repeat(50)));
}

export function printVersion(version: string): void {
  console.log(pc.dim("  ") + cursorGradient(`v${version}`) + pc.dim(" • Made with ♥"));
  console.log();
}

export function highlight(text: string): string {
  return pc.cyan(text);
}

export function dim(text: string): string {
  return pc.dim(text);
}

export function bold(text: string): string {
  return pc.bold(text);
}

export function gradientText(text: string): string {
  return cursorGradient(text);
}
