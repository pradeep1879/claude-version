import boxen, { type Options as BoxenOptions } from "boxen";
import chalk from "chalk";
import { cliTheme } from "../themes/theme";
import { getTerminalWidth } from "../utils/terminal";

type PanelOptions = {
  title?: string;
  subtitle?: string;
  tone?: "default" | "user" | "assistant" | "tool" | "error" | "system";
  padding?: number;
  margin?: BoxenOptions["margin"];
  dimBorder?: boolean;
};

const getToneColor = (tone: PanelOptions["tone"]) => {
  switch (tone) {
    case "user":
      return "blue";
    case "assistant":
      return "magenta";
    case "tool":
      return "green";
    case "error":
      return "red";
    case "system":
      return "yellow";
    default:
      return "gray";
  }
};

export const renderPanel = (content: string, options: PanelOptions = {}) => {
  const title = options.subtitle
    ? `${options.title ?? ""}${chalk.dim(`  ${options.subtitle}`)}`
    : options.title;

  return boxen(content, {
    width: Math.min(getTerminalWidth(), 108),
    padding: options.padding ?? 1,
    margin: options.margin ?? { top: 1, bottom: 0 },
    borderStyle: "round",
    borderColor: getToneColor(options.tone),
    title,
    titleAlignment: "left",
    dimBorder: options.dimBorder ?? false,
  });
};

export const renderRule = (label?: string) => {
  const width = Math.min(getTerminalWidth() - 4, 92);
  const left = "─".repeat(Math.max(8, Math.floor(width / 3)));
  const right = "─".repeat(Math.max(8, width - left.length - (label ? label.length + 2 : 0)));

  if (!label) {
    return cliTheme.brand.subtle("─".repeat(width));
  }

  return `${cliTheme.brand.subtle(left)} ${cliTheme.brand.muted(label)} ${cliTheme.brand.subtle(right)}`;
};
