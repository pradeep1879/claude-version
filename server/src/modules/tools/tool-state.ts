import type { ToolSet } from "ai";
import { availableTools } from "./tools.registry";

let enabledToolIds = new Set<string>();

export const enableTools = (toolIds: string[]) => {
  enabledToolIds = new Set(toolIds);
};

export const getEnabledTools = (): ToolSet | undefined => {
  const tools: ToolSet = {};

  for (const tool of availableTools) {
    if (enabledToolIds.has(tool.id)) {
      tools[tool.id] = tool.getTool();
    }
  }

  return Object.keys(tools).length > 0 ? tools : undefined;
};

export const getEnabledToolNames = () => {
  return availableTools
    .filter((tool) => enabledToolIds.has(tool.id))
    .map((tool) => tool.name);
};

export const resetTools = () => {
  enabledToolIds.clear();
};
