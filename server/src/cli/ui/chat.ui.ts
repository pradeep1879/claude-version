import chalk from "chalk";
import boxen from "boxen";
import { intro, outro } from "@clack/prompts";

export interface ChatSessionInfo {
  title: string;
  id: string;
  mode: string;
  tools?: string[];
}

export function showChatIntro() {
  intro(
    boxen(chalk.bold.cyan("Orbital AI Chat"), {
      padding: 1,
      borderStyle: "double",
      borderColor: "cyan",
    })
  );
}

export function showConversationInfo(info: ChatSessionInfo) {
  const toolsDisplay =
    info.tools && info.tools.length > 0
      ? `\n${chalk.gray("Active Tools:")} ${info.tools.join(", ")}`
      : `\n${chalk.gray("No tools enabled")}`;

  const box = boxen(
    `${chalk.bold("Conversation")}: ${info.title}
${chalk.gray("ID: " + info.id)}
${chalk.gray("Mode: " + info.mode)}${toolsDisplay}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "💬 Chat Session",
      titleAlignment: "center",
    }
  );

  console.log(box);
}

export function showHelp(tools: string[]) {
  const helpBox = boxen(
    `${chalk.gray("• Type your message and press Enter")}
${chalk.gray("• AI tools available:")} ${
      tools.length ? tools.join(", ") : "None"
    }
${chalk.gray("• Type 'exit' to end conversation")}
${chalk.gray("• Press Ctrl+C to quit anytime")}`,
    {
      padding: 1,
      margin: { bottom: 1 },
      borderStyle: "round",
      borderColor: "gray",
      dimBorder: true,
    }
  );

  console.log(helpBox);
}

export function showExit() {
  console.log(
    boxen(chalk.yellow("Chat session ended. Goodbye! 👋"), {
      padding: 1,
      borderStyle: "round",
      borderColor: "yellow",
    })
  );

  outro(chalk.green("Thanks for using Orbital AI"));
}