import chalk from "chalk";
import { requireUserFromToken } from "../../auth/get-user-from-token";
import { sendMessage } from "../../modules/ai/ai.service";
import {
  createConversation,
  createMessage,
  formatMessagesForAI,
  getMessages,
} from "../../modules/chat/chat.service";
import { availableTools } from "../../modules/tools/tools.registry";
import {
  enableTools,
  getEnabledToolNames,
  getEnabledTools,
  resetTools,
} from "../../modules/tools/tool-state";
import type { ToolCall } from "../../types/chat.types";
import { createPromptSession } from "../prompts/chat.prompt";
import { showChatIntro, showConversationInfo, showExit, showHelp } from "../ui/chat.ui";
import {
  renderErrorMessage,
  renderSystemMessage,
  renderToolCalls,
  renderToolResults,
  renderUserMessage,
  streamAssistantChunk,
  streamAssistantEnd,
  streamAssistantFail,
  streamAssistantStart,
} from "../ui/message.ui";
import { selectToolsUI } from "../ui/tool.ui";

export const getAIResponse = async (conversationId: string): Promise<string> => {
  const dbMessages = await getMessages(conversationId);
  const aiMessages = formatMessagesForAI(dbMessages);
  const tools = getEnabledTools();
  let fullResponse = "";
  const toolCalls: ToolCall[] = [];
  const startedAt = Date.now();

  streamAssistantStart();

  const result = await sendMessage(
    aiMessages,
    (chunk) => {
      fullResponse += chunk;
      streamAssistantChunk(chunk);
    },
    tools,
  );

  streamAssistantEnd(fullResponse);

  for (const step of result.steps) {
    if (Array.isArray(step.toolCalls)) {
      toolCalls.push(...(step.toolCalls as ToolCall[]));
    }
  }

  const durationMs = Date.now() - startedAt;
  renderToolCalls(toolCalls, durationMs);
  renderToolResults(result.toolResults, durationMs);

  return fullResponse;
};

const chatLoop = async (conversationId: string) => {
  const prompt = createPromptSession();
  showHelp(getEnabledToolNames());

  try {
    while (true) {
      const input = await prompt.read();

      if (input.kind === "empty") {
        continue;
      }

      if (input.kind === "command" && input.value === "help") {
        showHelp(getEnabledToolNames());
        continue;
      }

      if (input.kind === "command" && input.value === "clear") {
        console.clear();
        renderSystemMessage("Screen cleared. Conversation state is preserved.");
        continue;
      }

      if (input.kind === "command" && input.value === "exit") {
        showExit();
        break;
      }

      if (input.kind !== "message") {
        continue;
      }

      renderUserMessage(input.value);
      await createMessage(conversationId, "user", input.value);

      try {
        const response = await getAIResponse(conversationId);
        await createMessage(conversationId, "assistant", response);
      } catch (error) {
        streamAssistantFail();
        throw error;
      }
    }
  } finally {
    prompt.close();
  }
};

export const startToolChat = async () => {
  try {
    showChatIntro();

    const user = await requireUserFromToken();
    const selectedTools = await selectToolsUI(availableTools);

    enableTools(selectedTools);

    const conversation = await createConversation(user.id, "tool");

    showConversationInfo({
      title: conversation.title ?? "New conversation",
      id: conversation.id,
      mode: conversation.mode,
      tools: getEnabledToolNames(),
    });

    await chatLoop(conversation.id);
    resetTools();
  } catch (error) {
    renderErrorMessage(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
