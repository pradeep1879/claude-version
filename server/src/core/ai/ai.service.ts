import { google } from "@ai-sdk/google";
import { streamText, generateObject } from "ai";
import type { ToolSet } from "ai";
import type { ZodSchema } from "zod";
import chalk from "chalk";
import { config } from "../../config/google.cofig";
import type { AIMessage } from "../../types/chat.types";

export class AIService {
  private model;

  constructor() {
    if (!config.googleApiKey) {
      throw new Error(chalk.red("Missing GOOGLE_GENERATIVE_AI_API_KEY"));
    }

    this.model = google(config.model);
  }

  async sendMessage(
    messages: AIMessage[],
    onChunk?: (chunk: string) => void,
    tools?: ToolSet
  ) {
    const result = streamText({
      model: this.model,
      messages,
      tools,
      //@ts-ignore
      maxSteps: tools ? 5 : undefined,
    });

    let fullResponse = "";

    for await (const chunk of result.textStream) {
      fullResponse += chunk;

      if (onChunk) onChunk(chunk);
    }

    return {
      content: fullResponse,
      steps: Array.isArray(result.steps) ? result.steps : [],
      toolResults: Array.isArray(result.steps)
        ? result.steps.flatMap((s: { toolResults?: unknown[] }) => s.toolResults ?? [])
        : [],
    };
  }

  async generateStructured(schema: ZodSchema, prompt: string) {
    const result = await generateObject({
      model: this.model,
      schema,
      prompt,
    });

    return result.object;
  }
}