import { google } from "@ai-sdk/google";
import { generateObject, streamText } from "ai";
import type { ToolSet } from "ai";
import type { ZodSchema } from "zod";
import { env } from "../../config/env";
import type { AIMessage } from "../../types/chat.types";

const getModel = () => {
  if (!env.googleApiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  }

  return google(env.googleModel);
};

export const sendMessage = async (
  messages: AIMessage[],
  onChunk?: (chunk: string) => void,
  tools?: ToolSet,
) => {
  const result = streamText({
    model: getModel(),
    messages,
    tools,
  });

  let content = "";

  for await (const chunk of result.textStream) {
    content += chunk;

    if (onChunk) {
      onChunk(chunk);
    }
  }

  const steps = Array.isArray(result.steps) ? result.steps : [];

  return {
    content,
    steps,
    toolResults: steps.flatMap((step: { toolResults?: unknown[] }) => step.toolResults ?? []),
  };
};

export const generateStructured = async (schema: ZodSchema, prompt: string) => {
  const result = await generateObject({
    model: getModel(),
    schema,
    prompt,
  });

  return result.object;
};
