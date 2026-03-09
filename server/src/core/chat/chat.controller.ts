import { ChatService } from "./chat.service";
import { AIService } from "../ai/ai.service";
import { ToolManager } from "../tools/tool.manager";

export class ChatController {
  constructor(
    private chatService = new ChatService(),
    private aiService = new AIService()
  ) {}

  async processMessage(conversationId: string) {
    const messages = await this.chatService.getMessages(conversationId);

    const aiMessages = this.chatService.formatMessageForAI(messages);

    const tools = ToolManager.getEnabledTools();

    const response = await this.aiService.sendMessage(aiMessages, undefined, tools);

    return response.content;
  }
}