import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";

import { marked } from "marked"
//@ts-ignore 
import { markedTerminal } from "marked-terminal"

import { AIService } from "../ai/google.service.js";
import { ChatService } from "../chat/chat.service.js";
import { getStoredToken } from "../../commands/auth/token-store.js";
import { prisma } from "../../../../prisma/db.js";

type MessageRole = "user" | "assistant";

marked.use(
  markedTerminal({
    code: chalk.cyan,
    blockquote: chalk.gray.italic,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.underline.bold,
    hr: chalk.reset,
    listitem: chalk.reset,
    list: chalk.reset,
    paragraph: chalk.reset,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.yellow.bgBlack,
    del: chalk.dim.gray.strikethrough,
    link: chalk.blue.underline,
    href: chalk.blue.underline,
  })
);

const aiService = new AIService();
const chatService = new ChatService();

async function getUserFromToken() {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error("Not authenticated. Please run 'orbital login' first.");
  }

  const spinner = yoctoSpinner({ text: "Authenticating..." }).start();

  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: { token: token.access_token },
      },
    },
  });

  if (!user) {
    spinner.error("User not found");
    throw new Error("Authentication failed");
  }

  spinner.success(`Welcome back, ${user.name}!`);

  return user;
}

async function initConversation(userId: string, conversationId: string | null,mode = "chat") {
  const spinner = yoctoSpinner({ text: "Loading conversation..." }).start();

  const conversation = await chatService.getOrCreateConversation(userId, conversationId!, mode);
  console.log("below get or create conversation", conversation)
  spinner.success("Conversation loaded.");

  const conversationInfo = boxen(
    `${chalk.bold("Conversation")}: ${conversation?.title}\n${chalk.gray(
      "ID: " + conversation?.id
    )}\n${chalk.gray("Mode: " + conversation?.mode)}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "💬 Chat Session",
      titleAlignment: "center",
    }
  );

  console.log(conversationInfo);

  if (conversation?.messages?.length > 0) {
    console.log(chalk.yellow("Previous messages:\n"));
    displayMessages(conversation?.messages);
  }

  return conversation;
}

function displayMessages(messages: any[]) {
  messages.forEach((msg) => {
    if (msg.role === "user") {
      console.log(
        boxen(chalk.white(msg.content), {
          padding: 1,
          margin: { left: 2, bottom: 1 },
          borderStyle: "round",
          borderColor: "blue",
          title: "👤 You",
        })
      );
    } else {
      const rendered = marked.parse(msg.content);

      console.log(
        boxen(rendered.trim(), {
          padding: 1,
          margin: { left: 2, bottom: 1 },
          borderStyle: "round",
          borderColor: "green",
          title: "🤖 Assistant",
        })
      );
    }
  });
}

async function saveMessage(
  conversationId: string,
  role: MessageRole,
  content: string
) {
  return chatService.createMessage(conversationId, role, content);
}

async function getAIResponse(conversationId: string) {
  const spinner = yoctoSpinner({ text: "AI is thinking..." }).start();

  const dbMessages = await chatService.getMessages(conversationId);
  const aiMessages = chatService.formatMessageForAI(dbMessages); 

  let fullResponse = "";
  let firstChunk = true;

  const result = await aiService.sendMessage(aiMessages, (chunk: string) => {
    if (firstChunk) {
      spinner.stop();
      console.log("\n" + chalk.green.bold("Assistant:"));
      console.log(chalk.gray("-".repeat(60)));
      firstChunk = false;
    }

    fullResponse += chunk;
  });

  console.log("\n");
  console.log(marked.parse(fullResponse));
  console.log(chalk.gray("─".repeat(60)));
  console.log("\n");

  return result.content;
}

async function updateConversationTitle(
  conversationId: string,
  userInput: string,
  messageCount: number
) {
  if (messageCount === 1) {
    const title =
      userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");

    await chatService.updateTitle(conversationId, title);
  }
}

async function chatLoop(conversation: any) {
  const helpBox = boxen(
    `${chalk.gray("Type your message and press Enter")}
${chalk.gray("Type 'exit' to end conversation")}
${chalk.gray("Press Ctrl + C to quit anytime")}`,
    {
      padding: 1,
      margin: { bottom: 1 },
      borderColor: "gray",
      borderStyle: "round",
      dimBorder: true,
    }
  );

  console.log(helpBox);

  while (true) {
    const userInput = await text({
      message: chalk.blue("Your message"),
      placeholder: "Type your message...",
    });

    if (isCancel(userInput)) {
      console.log(
        boxen(chalk.yellow("Chat session ended!"), {
          padding: 1,
          borderColor: "yellow",
          borderStyle: "round",
        })
      );

      process.exit(0);
    }

    if (userInput.toLowerCase() === "exit") break;

    await saveMessage(conversation.id, "user", userInput);

    const messages = await chatService.getMessages(conversation.id);

    const aiResponse = await getAIResponse(conversation.id);

    await saveMessage(conversation.id, "assistant", aiResponse);

    await updateConversationTitle(conversation.id, userInput, messages.length);
  }
}

export async function startChat(
  mode = "chat",
  conversationId: string | null = null
) {
  try {
    intro(
      boxen(chalk.bold.cyan("Orbital AI Chat"), {
        padding: 1,
        borderStyle: "double",
        borderColor: "cyan",
      })
    );

    const user = await getUserFromToken();
    console.log("start chat", user.id)
    const conversation = await initConversation(user.id, conversationId, mode);

    await chatLoop(conversation);

    outro(chalk.green("Thanks for chatting!"));
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