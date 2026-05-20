import chalk from "chalk";
import type { ToolCall } from "../../types/chat.types";
import { renderPanel } from "../layouts/panel";
import { renderMarkdown } from "../markdown/render-markdown";
import { cliTheme } from "../themes/theme";
import { estimateTokenCount } from "../utils/terminal";

const truncateValue = (value: string, maxLength = 1200) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n${chalk.dim("… output truncated for readability")}`;
};

export const renderUserBubble = (message: string) => {
  return renderPanel(chalk.white(message), {
    title: cliTheme.roles.user("You"),
    subtitle: chalk.dim("prompt"),
    tone: "user",
    margin: { top: 1, bottom: 1 },
  });
};

export const renderAssistantBubble = (message: string, meta?: string[]) => {
  const footer =
    meta && meta.length > 0
      ? `\n\n${cliTheme.brand.subtle("─".repeat(28))}\n${chalk.dim(meta.join("  •  "))}`
      : "";

  return renderPanel(`${renderMarkdown(message)}${footer}`, {
    title: cliTheme.roles.assistant("Assistant"),
    subtitle: chalk.dim(`~${estimateTokenCount(message)} tok`),
    tone: "assistant",
    padding: 1,
    margin: { top: 1, bottom: 1 },
  });
};

export const renderSystemNotice = (message: string) => {
  return renderPanel(chalk.dim(message), {
    title: cliTheme.roles.system("System"),
    tone: "system",
    padding: 1,
    margin: { top: 1, bottom: 1 },
    dimBorder: true,
  });
};

export const renderErrorBubble = (message: string) => {
  return renderPanel(chalk.red(message), {
    title: cliTheme.roles.error("Error"),
    tone: "error",
    padding: 1,
    margin: { top: 1, bottom: 1 },
  });
};

export const renderToolCallSummary = (toolCalls: ToolCall[], durationMs: number) => {
  if (toolCalls.length === 0) {
    return "";
  }

  const content = toolCalls
    .map((toolCall, index) => {
      return `${chalk.bold(`${index + 1}. ${toolCall.toolName}`)}\n${chalk.dim(truncateValue(JSON.stringify(toolCall.args, null, 2), 400))}`;
    })
    .join("\n\n");

  return renderPanel(`${chalk.green("Status")} ${chalk.dim("success")}\n${chalk.dim(`Completed in ${durationMs}ms`) }\n\n${content}`, {
    title: cliTheme.roles.tool("Tool Calls"),
    tone: "tool",
    margin: { top: 1, bottom: 1 },
  });
};

export const renderToolResultSummary = (toolResults: unknown[], durationMs: number) => {
  if (toolResults.length === 0) {
    return "";
  }

  const content = toolResults
    .map((toolResult, index) => {
      const output = toolResult as { toolName?: string; result?: unknown };

      return `${chalk.bold(`${index + 1}. ${output.toolName ?? "unknown"}`)}\n${chalk.dim(truncateValue(JSON.stringify(output.result, null, 2), 500))}`;
    })
    .join("\n\n");

  return renderPanel(`${chalk.green("Status")} ${chalk.dim("completed")}\n${chalk.dim(`Settled in ${durationMs}ms`) }\n\n${content}`, {
    title: cliTheme.roles.tool("Tool Results"),
    tone: "tool",
    margin: { top: 0, bottom: 1 },
  });
};
