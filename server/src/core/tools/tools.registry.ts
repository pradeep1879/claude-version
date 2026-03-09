import { google } from "@ai-sdk/google";
import type { Tool } from "ai";

export interface AvailableTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  getTool: () => Tool;
}

export const availableTools: AvailableTool[] = [
  {
    id: "google_search",
    name: "Google Search",
    description: "Search real-time information",
    enabled: false,
    getTool: () => google.tools.googleSearch({}),
  },
  {
    id: "code_execution",
    name: "Code Execution",
    description: "Execute Python code",
    enabled: false,
    getTool: () => google.tools.codeExecution({}),
  },
];