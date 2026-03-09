import chalk from "chalk";
import { select } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";




import { startChat } from "./chat.command";

import { prisma } from "../../../prisma/db";
import { startToolChat } from "./tool.command";
import { getStoredToken } from "../../auth/token-store";


export const wakeUpAction = async () => {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error(chalk.red("You are not authenticated. Please login first"));
  }

  const spinner = yoctoSpinner({ text: "Fetching user information..." });

  spinner.start();

  try {
    const user = await prisma.user.findFirst({
      where: {
        sessions: {
          some: { token: token.access_token },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      throw new Error(chalk.red("User not found"));
    }

    spinner.stop();

    console.log(chalk.green(`Welcome back, ${user.name}!`));

    const choice = await select({
      message: "Select an option",
      options: [
        {
          value: "chat",
          label: "Chat",
          hint: "Simple chat with AI",
        },
        {
          value: "tool",
          label: "Tool Calling",
          hint: "Chat with tools (Google Search, Code Execution)",
        },
        {
          value: "agent",
          label: "Agentic Mode",
          hint: "Advanced AI agent (Coming soon...)",
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
        console.log(chalk.yellow("Agent mode coming soon..."));
        break;
    }
  } catch (error) {
    console.error(chalk.red("Error while waking up:"), error);
  }
};