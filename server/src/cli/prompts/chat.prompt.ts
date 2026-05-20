import { createInterface } from "node:readline/promises";
import chalk from "chalk";
import { stdin as input, stdout as output } from "node:process";
import { cliTheme } from "../themes/theme";

export type PromptResult =
  | { kind: "message"; value: string }
  | { kind: "command"; value: "exit" | "help" | "clear" }
  | { kind: "empty" };

export type PromptSession = {
  read: () => Promise<PromptResult>;
  close: () => void;
};

const PROMPT = `${cliTheme.roles.user("You")} ${chalk.dim("›")} `;
const CONTINUATION_PROMPT = `${chalk.dim("…")} `;

export const createPromptSession = (): PromptSession => {
  const rl = createInterface({
    input,
    output,
    historySize: 100,
    removeHistoryDuplicates: true,
    terminal: true,
  });

  const read = async (): Promise<PromptResult> => {
    const firstLine = (await rl.question(PROMPT)).trimEnd();

    if (!firstLine.trim()) {
      return { kind: "empty" };
    }

    if (firstLine === "/exit" || firstLine === "exit") {
      return { kind: "command", value: "exit" };
    }

    if (firstLine === "/help") {
      return { kind: "command", value: "help" };
    }

    if (firstLine === "/clear") {
      return { kind: "command", value: "clear" };
    }

    if (firstLine === "/multi" || firstLine === "/multiline") {
      const lines: string[] = [];

      while (true) {
        const nextLine = await rl.question(CONTINUATION_PROMPT);

        if (nextLine.trim() === "/send") {
          break;
        }

        if (nextLine.trim() === "/cancel") {
          return { kind: "empty" };
        }

        lines.push(nextLine);
      }

      return { kind: "message", value: lines.join("\n").trim() };
    }

    return { kind: "message", value: firstLine };
  };

  return {
    read,
    close: () => rl.close(),
  };
};
