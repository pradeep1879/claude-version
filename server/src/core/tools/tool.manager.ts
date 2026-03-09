import type { ToolSet } from "ai";
import { availableTools } from "./tools.registry";


export class ToolManager {
  static enableTools(ids: string[]) {
    availableTools.forEach((t) => {
      t.enabled = ids.includes(t.id);
    });
  }

  static getEnabledTools(): ToolSet | undefined {
    const tools: ToolSet = {};

    for (const tool of availableTools) {
      if (tool.enabled) {
        tools[tool.id] = tool.getTool();
      }
    }

    return Object.keys(tools).length ? tools : undefined;
  }

  static getEnabledToolNames() {
    return availableTools.filter((t) => t.enabled).map((t) => t.name);
  }

  static resetTools() {
    availableTools.forEach((t) => (t.enabled = false));
  }
}