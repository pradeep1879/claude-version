import { prisma } from "../../../prisma/db";
import { sendMessage } from "../ai/ai.service";
import { getEnabledTools } from "../tools/tool-state";

type LocalConversation = {
  id: string;
  userId: string;
  title: string | null;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
};

type LocalMessage = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: Date;
};

const localConversations = new Map<string, LocalConversation>();
const localMessages = new Map<string, LocalMessage[]>();
let warnedAboutDatabaseFallback = false;

const createLocalId = (prefix: string) => {
  return `${prefix}_${crypto.randomUUID()}`;
};

const isPersistenceError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return true;
  }

  return (
    error.name.includes("Prisma") ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("DatabaseNotReachable") ||
    error.message.includes("P1001") ||
    error.message.includes("prisma.conversation.create") ||
    error.message.includes("prisma.message.create") ||
    error.message.includes("prisma.message.findMany") ||
    error.message.includes("prisma.conversation.findFirst")
  );
};

const warnDatabaseFallback = (error?: unknown) => {
  if (warnedAboutDatabaseFallback) {
    return;
  }

  warnedAboutDatabaseFallback = true;
  const reason =
    error instanceof Error
      ? `\nReason: ${error.message.split("\n")[0]}`
      : "";

  console.warn(
    `Persistent chat storage unavailable. Continuing with an in-memory CLI session; conversation history will not persist.${reason}`,
  );
};

const createLocalConversation = (
  userId: string,
  mode: string,
  title?: string,
): LocalConversation => {
  const now = new Date();
  const conversation: LocalConversation = {
    id: createLocalId("local_conversation"),
    userId,
    mode,
    title: title || "New conversation",
    createdAt: now,
    updatedAt: now,
  };

  localConversations.set(conversation.id, conversation);
  localMessages.set(conversation.id, []);

  return conversation;
};

const createLocalMessage = (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) => {
  const message: LocalMessage = {
    id: createLocalId("local_message"),
    conversationId,
    role,
    content,
    createdAt: new Date(),
  };

  const messages = localMessages.get(conversationId) ?? [];
  messages.push(message);
  localMessages.set(conversationId, messages);

  const conversation = localConversations.get(conversationId);

  if (conversation) {
    conversation.updatedAt = new Date();
    localConversations.set(conversationId, conversation);
  }

  return message;
};

export const createConversation = async (
  userId: string,
  mode = "chat",
  title?: string,
) => {
  try {
    return await prisma.conversation.create({
      data: {
        userId,
        mode,
        title: title || "New conversation",
      },
    });
  } catch (error) {
    if (!isPersistenceError(error)) {
      throw error;
    }

    warnDatabaseFallback(error);
    return createLocalConversation(userId, mode, title);
  }
};

export const getOrCreateConversation = async (
  userId: string,
  conversationId: string | null,
) => {
  if (conversationId) {
    const localConversation = localConversations.get(conversationId);

    if (localConversation && localConversation.userId === userId) {
      return {
        ...localConversation,
        messages: [...(localMessages.get(conversationId) ?? [])],
      };
    }

    try {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (conversation) {
        return conversation;
      }
    } catch (error) {
      if (!isPersistenceError(error)) {
        throw error;
      }

      warnDatabaseFallback(error);
    }
  }

  return createConversation(userId);
};

export const createMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) => {
  if (localConversations.has(conversationId)) {
    return createLocalMessage(conversationId, role, content);
  }

  try {
    return await prisma.message.create({
      data: { conversationId, role, content },
    });
  } catch (error) {
    if (!isPersistenceError(error)) {
      throw error;
    }

    warnDatabaseFallback(error);
    return createLocalMessage(conversationId, role, content);
  }
};

export const getMessages = async (conversationId: string) => {
  if (localConversations.has(conversationId)) {
    return [...(localMessages.get(conversationId) ?? [])].sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );
  }

  try {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    if (!isPersistenceError(error)) {
      throw error;
    }

    warnDatabaseFallback(error);
    return [...(localMessages.get(conversationId) ?? [])].sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );
  }
};

export const formatMessagesForAI = (
  messages: { role: string; content: string }[],
) => {
  return messages.map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
  }));
};

export const processMessage = async (conversationId: string) => {
  const messages = await getMessages(conversationId);
  const aiMessages = formatMessagesForAI(messages);
  const tools = getEnabledTools();
  const response = await sendMessage(aiMessages, undefined, tools);

  return response.content;
};
