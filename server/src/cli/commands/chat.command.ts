import boxen from "boxen";
import chalk from "chalk";
import { requireUserFromToken } from "../../auth/get-user-from-token";
import { requireAuth } from "../../auth/token-store";
import { sendMessage } from "../../modules/ai/ai.service";
import {
  createConversation,
  createMessage,
  formatMessagesForAI,
  getMessages,
} from "../../modules/chat/chat.service";
import { createPromptSession } from "../prompts/chat.prompt";
import { showChatIntro, showConversationInfo, showExit, showHelp } from "../ui/chat.ui";
import {
  renderUserMessage,
  streamAssistantChunk,
  streamAssistantEnd,
  streamAssistantStart,
} from "../ui/message.ui";

export async function startChat() {
  const prompt = createPromptSession();

  try {
    showChatIntro();

    await requireAuth();

    const user = await requireUserFromToken();
    const conversation = await createConversation(user.id, "chat");

    showConversationInfo({
      title: conversation.title ?? "New conversation",
      id: conversation.id,
      mode: conversation.mode,
      tools: [],
    });

    showHelp([]);

    while (true) {
      const input = await prompt.read();

      if (input.kind === "empty") {
        continue;
      }

      if (input.kind === "command" && input.value === "help") {
        showHelp([]);
        continue;
      }

      if (input.kind === "command" && input.value === "clear") {
        console.clear();
        showConversationInfo({
          title: conversation.title ?? "New conversation",
          id: conversation.id,
          mode: conversation.mode,
          tools: [],
        });
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
      await createMessage(conversation.id, "user", input.value);

      const dbMessages = await getMessages(conversation.id);
      const aiMessages = formatMessagesForAI(dbMessages);
      let response = "";

      streamAssistantStart();
      const result = await sendMessage(aiMessages, (chunk) => {
        response += chunk;
        streamAssistantChunk(chunk);
      });
      streamAssistantEnd(response);

      await createMessage(conversation.id, "assistant", response);
    }
  } catch (error: any) {
    console.log(
      boxen(chalk.red(`Error: ${error.message}`), {
        padding: 1,
        borderColor: "red",
        borderStyle: "round",
      }),
    );

    process.exit(1);
  } finally {
    prompt.close();
  }
}
