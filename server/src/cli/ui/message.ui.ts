import type { ToolCall } from "../../types/chat.types";
import {
  renderAssistantBubble,
  renderErrorBubble,
  renderSystemNotice,
  renderToolCallSummary,
  renderToolResultSummary,
  renderUserBubble,
} from "../components/message";
import {
  createAssistantStreamRenderer,
} from "../streaming/assistant-stream";

type AssistantStream = ReturnType<typeof createAssistantStreamRenderer>;

let assistantStream: AssistantStream | null = null;
let streamInitialized = false;

export const renderUserMessage = (message: string) => {
  console.log(renderUserBubble(message));
};

export const renderAssistantMessage = (message: string, meta?: string[]) => {
  console.log(renderAssistantBubble(message, meta));
};

export const renderSystemMessage = (message: string) => {
  console.log(renderSystemNotice(message));
};

export const renderErrorMessage = (message: string) => {
  console.log(renderErrorBubble(message));
};

export const renderToolCalls = (toolCalls: ToolCall[], durationMs: number) => {
  const output = renderToolCallSummary(toolCalls, durationMs);

  if (output) {
    console.log(output);
  }
};

export const renderToolResults = (toolResults: unknown[], durationMs: number) => {
  const output = renderToolResultSummary(toolResults, durationMs);

  if (output) {
    console.log(output);
  }
};

export const streamAssistantStart = () => {
  assistantStream = createAssistantStreamRenderer();
  streamInitialized = true;
};

export const streamAssistantChunk = (chunk: string) => {
  if (!streamInitialized) {
    streamAssistantStart();
  }

  assistantStream?.push(chunk);
};

export const streamAssistantEnd = (message: string) => {
  if (!streamInitialized) {
    return;
  }

  assistantStream?.complete(message);
  assistantStream = null;
  streamInitialized = false;
};

export const streamAssistantFail = (message?: string) => {
  if (!streamInitialized) {
    return;
  }

  assistantStream?.fail(message);
  assistantStream = null;
  streamInitialized = false;
};
