import { google } from "@ai-sdk/google";
import type { Tool } from "ai";
import { env } from "../../config/env";

export interface AvailableTool {
  id: string;
  name: string;
  description: string;
  getTool: () => Tool;
}

const getGoogleTools = () => {
  if (!env.googleApiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  }

  return google.tools;
};

export const availableTools: AvailableTool[] = [
  {
    id: "google_search",
    name: "Google Search",
    description: "Search real-time information",
    getTool: () => getGoogleTools().googleSearch({}),
  },
  {
    id: "code_execution",
    name: "Code Execution",
    description: "Execute Python code",
    getTool: () => getGoogleTools().codeExecution({}),
  },
];
