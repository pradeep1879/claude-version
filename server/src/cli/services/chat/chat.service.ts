import { prisma } from "../../../../prisma/db";

type Role = "user" | "assistant";

export class ChatService {

  async createConversation(userId: string, mode = "chat", title: string | null = null) {
    return prisma.conversation.create({
      data: {
        userId,
        mode,
        title: title || `New ${mode} conversation`,
      },
    });
  }

  async getOrCreateConversation(userId: string, conversationId: string | null, mode = "chat") {



    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (conversation) return conversation;
    }

    return this.createConversation(userId, mode);
  }

  async createMessage(conversationId: string, role: Role, content: string) {
    return prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  }

  async getMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async getUserConversation(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    return prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userId,
      },
    });
  }

  async updateTitle(conversationId: string, title: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  formatMessageForAI(messages: any[]) {
    return messages.map((msg) => ({
      role: msg.role,
      content: String(msg.content),
    }));
  }
}