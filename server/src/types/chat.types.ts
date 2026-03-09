export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string;
  mode: string;
  messages?: ChatMessage[];
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}




export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}