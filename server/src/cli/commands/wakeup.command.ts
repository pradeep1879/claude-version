import chalk from "chalk";
import { select } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import { requireUserFromToken } from "../../auth/get-user-from-token";
import { getStoredToken } from "../../auth/token-store";
import { renderErrorMessage, renderSystemMessage } from "../ui/message.ui";
import { startChat } from "./chat.command";
import { startToolChat } from "./tool.command";

export const wakeUpAction = async () => {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error(chalk.red("You are not authenticated. Please login first"));
  }

  const spinner = yoctoSpinner({ text: "Preparing your workspace..." });

  spinner.start();

  try {
    const user = await requireUserFromToken();

    spinner.stop();

    renderSystemMessage(`Welcome back, ${user.name}. Choose a mode to continue.`);

    const choice = await select({
      message: "Select an option",
      options: [
        {
          value: "chat",
          label: "Chat",
          hint: "Simple conversation with premium streaming UI",
        },
        {
          value: "tool",
          label: "Tool Calling",
          hint: "Chat with tools and structured tool execution cards",
        },
        {
          value: "agent",
          label: "Agentic Mode",
          hint: "Reserved for the next phase",
        },
      ],
    });

    switch (choice) {
      case "chat":
        await startChat();
        break;

      case "tool":
        await startToolChat();
        break;

      case "agent":
        renderSystemMessage("Agent mode is not wired yet, but the UI is ready for it.");
        break;
    }
  } catch (error) {
    spinner.stop();
    renderErrorMessage(`Error while waking up: ${(error as Error).message}`);
  }
};
