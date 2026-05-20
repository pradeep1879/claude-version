import chalk from "chalk";
import { env } from "../../config/env";
import { renderAppBanner, renderSessionBanner } from "../components/status";
import { renderSystemMessage } from "./message.ui";

export interface ChatSessionInfo {
  title: string;
  id: string;
  mode: string;
  tools?: string[];
}

export const showChatIntro = () => {
  console.log(renderAppBanner());
};

export const showConversationInfo = (info: ChatSessionInfo) => {
  const details = [
    `${chalk.dim("Conversation")} ${chalk.white(info.title)}`,
    `${chalk.dim("Mode")} ${chalk.white(info.mode)}`,
    `${chalk.dim("Model")} ${chalk.white(env.googleModel)}`,
    `${chalk.dim("Session")} ${chalk.white(info.id)}`,
    `${chalk.dim("Tools")} ${chalk.white(info.tools && info.tools.length > 0 ? info.tools.join(", ") : "none")}`,
  ];

  console.log(
    renderSessionBanner({
      title: "Ready for chat",
      subtitle: "The renderer is upgraded, but the orchestration layer is unchanged.",
      details,
    }),
  );
};

export const showHelp = (tools: string[]) => {
  const toolSummary = tools.length > 0 ? tools.join(", ") : "none";

  renderSystemMessage(
    [
      "Enter a prompt and press Enter to send.",
      "Use /multiline then /send for multi-line input.",
      "Use /help, /clear, or /exit at any time.",
      `Active tools: ${toolSummary}.`,
      "Use ↑ and ↓ to navigate prompt history.",
    ].join("\n"),
  );
};

export const showExit = () => {
  renderSystemMessage("Session closed. Thanks for using Orbital.");
};
