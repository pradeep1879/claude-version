import { prisma } from "../../../prisma/db";


export class ChatService {
  
  async createConversation(userId: string, mode = "chat", title?: string) {
    console.log(userId)
    return prisma.conversation.create({
      data: {
        userId,
        mode,
        title: title || "New conversation",
      },
    });
  }

  async getOrCreateConversation(userId: string, conversationId: string | null) {
    if (conversationId) {
      const convo = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (convo) return convo;
    }

    return this.createConversation(userId);
  }

  async createMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) {
    return prisma.message.create({
      data: { conversationId, role, content },
    });
  }

  async getMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  formatMessageForAI(messages: { role: string; content: string }[]) {
    return messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }
}