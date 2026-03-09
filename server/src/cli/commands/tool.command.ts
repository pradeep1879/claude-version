import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";

import { ChatService } from "../../core/chat/chat.service";
import { AIService } from "../../core/ai/ai.service";

import { ToolManager } from "../../core/tools/tool.manager";


import { renderUserMessage, renderAssistantMessage, streamAssistantChunk, streamAssistantEnd, streamAssistantStart } from "../ui/message.ui";
import { showChatIntro, showConversationInfo, showHelp, showExit } from "../ui/chat.ui";

import { prisma } from "../../../prisma/db";
import type { ToolCall } from "../../types/chat.types";
import { selectToolsUI } from "../ui/tool.ui";
import { availableTools } from "../../core/tools/tools.registry";
import { getStoredToken } from "../../auth/token-store";



const chatService = new ChatService();
const aiService = new AIService();

async function getUserId(): Promise<string> {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error("Not authenticated. Please login first.");
  }

  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: { token: token.access_token },
      },
    },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.id;
}

export async function getAIResponse(conversationId: string): Promise<string> {

  const spinner = yoctoSpinner({ text: "AI thinking..." }).start()

  // 1️⃣ Load conversation history
  const dbMessages = await chatService.getMessages(conversationId)
  const aiMessages = chatService.formatMessageForAI(dbMessages)

  // 2️⃣ Load enabled tools
  const tools = ToolManager.getEnabledTools()

  let fullResponse = ""
  let firstChunk = true

  const toolCalls: ToolCall[] = []

  // 3️⃣ Call LLM
  const result = await aiService.sendMessage(
    aiMessages,
    (chunk) => {

      if (firstChunk) {
        spinner.stop()
        streamAssistantStart()
        firstChunk = false
      }

      streamAssistantChunk(chunk)
      fullResponse += chunk

    },
    tools
  )

  streamAssistantEnd()

  // 4️⃣ Collect tool calls
  if (Array.isArray(result.steps)) {
    for (const step of result.steps) {
      if (step.toolCalls) {
        toolCalls.push(...step.toolCalls as ToolCall[])
      }
    }
  }

  // 5️⃣ Show tool calls
  if (toolCalls.length > 0) {
    console.log("\n")

    console.log(
      boxen(
        toolCalls
          .map(t =>
            `${chalk.cyan("🔧 Tool:")} ${t.toolName}\n${chalk.gray(JSON.stringify(t.args, null, 2))}`
          )
          .join("\n\n"),
        {
          title: "Tool Calls",
          borderStyle: "round",
          borderColor: "cyan",
          padding: 1
        }
      )
    )
  }

  // 6️⃣ Show tool results
  if (result.toolResults?.length) {

    console.log(
      boxen(
        result.toolResults
          .map(tr =>
            //@ts-ignore
            `${chalk.green("✅ Tool:")} ${tr.toolName}\n${chalk.gray(JSON.stringify(tr.result).slice(0,200))}`
          )
          .join("\n\n"),
        {
          title: "Tool Results",
          borderStyle: "round",
          borderColor: "green",
          padding: 1
        }
      )
    )

  }

  return fullResponse
}

async function chatLoop(conversationId: string) {
  showHelp(ToolManager.getEnabledToolNames());

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

    renderUserMessage(input);

    await chatService.createMessage(conversationId, "user", input);

    const response = await getAIResponse(conversationId);

    await chatService.createMessage(conversationId, "assistant", response);
  }
}




export async function startToolChat() {
  try {
    showChatIntro();

    const userId = await getUserId();

    const selectedTools = await selectToolsUI(availableTools);

    ToolManager.enableTools(selectedTools);

    const conversation = await chatService.createConversation(userId, "tool");

    showConversationInfo({
      //@ts-ignore
      title: conversation.title,
      id: conversation.id,
      mode: conversation.mode,
      tools: ToolManager.getEnabledToolNames(),
    });

    await chatLoop(conversation.id);

    ToolManager.resetTools();
  } catch (error) {
    console.error(
      boxen(chalk.red(`Error: ${(error as Error).message}`), {
        borderStyle: "round",
        borderColor: "red",
      })
    );

    process.exit(1);
  }
}