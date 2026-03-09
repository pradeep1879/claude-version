import { multiselect, isCancel } from "@clack/prompts";
import chalk from "chalk";
import boxen from "boxen";

export async function selectToolsUI(
  tools: { id: string; name: string; description: string }[]
): Promise<string[]> {
  const selected = await multiselect({
    message: chalk.cyan("Select tools to enable"),
    options: tools.map((t) => ({
      value: t.id,
      label: t.name,
      hint: t.description,
    })),
  });

  if (isCancel(selected)) {
    console.log(chalk.yellow("Tool selection cancelled"));
    process.exit(0);
  }

  const ids = selected as string[];

  if (ids.length === 0) {
    console.log(chalk.yellow("No tools selected."));
  } else {
    console.log(
      boxen(
        chalk.green(
          ids.map((id) => `• ${id}`).join("\n")
        ),
        { title: "Enabled Tools", borderStyle: "round" }
      )
    );
  }

  return ids;
}