import { text, isCancel } from "@clack/prompts";
import chalk from "chalk";
import boxen from "boxen";


import { ChatService } from "../../core/chat/chat.service";

import { renderUserMessage, renderAssistantMessage } from "../ui/message.ui";
import {
  showChatIntro,
  showConversationInfo,
  showHelp,
  showExit,
} from "../ui/chat.ui";
import { requireAuth } from "../../auth/token-store";
import { prisma } from "../../../prisma/db";
import { ChatController } from "../../core/chat/chat.controller";
import { getUserFromToken } from "../../auth/get-user-from-token";




export async function startChat() {
  try {
    // Intro UI
    showChatIntro();

    // Auth check
    const token = await requireAuth();

    const chatService = new ChatService();
    const controller = new ChatController();

    const user = await getUserFromToken()
    if (!user) {
      throw new Error("User not found")
    }
    // Create conversation
    const conversation = await chatService.createConversation(
      user?.id,
      "chat"
    );

    // Show conversation info
    showConversationInfo({
      //@ts-ignore
      title: conversation.title,
      id: conversation.id,
      mode: conversation.mode,
      tools: [],
    });

    // Show help UI
    showHelp([]);

    while (true) {
      const input = await text({
        message: "💬 Your message",
        placeholder: "Ask something...",
      });

      if (isCancel(input)) {
        showExit();
        process.exit(0);
      }

      if (typeof input !== "string") continue;

      if (input.toLowerCase() === "exit") {
        showExit();
        break;
      }

      // Render user message
      renderUserMessage(input);

      // Save message
      await chatService.createMessage(conversation.id, "user", input);

      // Get AI response
      const response = await controller.processMessage(conversation.id);

      // Save assistant message
      await chatService.createMessage(conversation.id, "assistant", response);

      // Render assistant response
      renderAssistantMessage(response);
    }
  } catch (error: any) {
    console.log(
      boxen(chalk.red(`Error: ${error.message}`), {
        padding: 1,
        borderColor: "red",
        borderStyle: "round",
      })
    );

    process.exit(1);
  }
}