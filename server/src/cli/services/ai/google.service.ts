import { google } from "@ai-sdk/google";
import { generateObject, streamText } from "ai";
import type { ToolSet } from "ai";
import type { ZodSchema } from "zod";

import chalk from "chalk";
import { config } from "../../../config/google.cofig";

export class AIService {
  model: any;

  constructor() {
    if (!config.googleApiKey) {
      throw new Error(
        chalk.red("GOOGLE_GENERATIVE_AI_API_KEY is not set in env")
      );
    }

    this.model = google(config.model);
  }

  async sendMessage(
    messages: any,
    onChunk?: (chunk: string) => void,
    tools?: ToolSet,
    onToolCall?: (calls: any[]) => void
  ) {
    try {
      const streamConfig: any = {
        model: this.model,
        messages,
      };

      if (tools && Object.keys(tools).length > 0) {
        streamConfig.tools = tools;
        streamConfig.maxSteps = 5;

        console.log(
          chalk.gray(
            `[DEBUG] Tool enabled: ${Object.keys(tools).join(", ")}`
          )
        );
      }

      const result = streamText(streamConfig);

      let fullResponse = "";

      for await (const chunk of result.textStream) {
        fullResponse += chunk;

        if (onChunk) {
          onChunk(chunk);
        }
      }

      const toolCalls: any[] = [];
      const toolResults: any[] = [];

      if (result.steps && Array.isArray(result.steps)) {
        for (const step of result.steps) {
          if (step.toolCalls && step.toolCalls.length > 0) {
            for (const toolCall of step.toolCalls) {
              toolCalls.push(toolCall);

              if (onToolCall) {
                onToolCall(toolCalls);
              }
            }
          }

          if (step.toolResults && step.toolResults.length > 0) {
            toolResults.push(...step.toolResults);
          }
        }
      }

      return {
        content: fullResponse,
        finishReason: result.finishReason,
        usage: result.usage,
        toolCalls,
        toolResults,
        steps: result.steps,
      };
    } catch (error: any) {
      console.error(chalk.red("AI Service error"), error.message);
      throw error;
    }
  }

  async getMessage(messages: any, tools?: ToolSet) {
    let fullResponse = "";

    const result = await this.sendMessage(
      messages,
      (chunk) => {
        fullResponse += chunk;
      },
      tools
    );

    return result.content;
  }

  async generateStructured(schema: ZodSchema, prompt: string) {
    try {
      const result = await generateObject({
        model: this.model,
        schema,
        prompt,
      });

      return result.object;
    } catch (error: any) {
      console.error(
        chalk.red("AI Structured Generation Error:"),
        error.message
      );
      throw error;
    }
  }
}