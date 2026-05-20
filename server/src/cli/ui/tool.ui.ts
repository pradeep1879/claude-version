import { isCancel, multiselect } from "@clack/prompts";
import { renderSystemMessage, renderToolCalls } from "./message.ui";

export async function selectToolsUI(
  tools: { id: string; name: string; description: string }[],
): Promise<string[]> {
  const selected = await multiselect({
    message: "Enable assistant tools",
    options: tools.map((tool) => ({
      value: tool.id,
      label: tool.name,
      hint: tool.description,
    })),
  });

  if (isCancel(selected)) {
    renderSystemMessage("Tool selection cancelled.");
    process.exit(0);
  }

  const ids = selected as string[];

  if (ids.length === 0) {
    renderSystemMessage("No tools selected. Continuing in pure chat mode.");
  } else {
    renderToolCalls(
      ids.map((id) => ({
        toolName: id,
        args: { status: "enabled" },
      })),
      0,
    );
  }

  return ids;
}
