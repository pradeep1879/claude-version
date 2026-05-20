import chalk from "chalk";
import { env } from "../../config/env";
import { renderPanel, renderRule } from "../layouts/panel";
import { formatBrand, cliTheme } from "../themes/theme";

export type SessionBannerOptions = {
  title: string;
  subtitle: string;
  details: string[];
};

export const renderAppBanner = () => {
  const title = `${formatBrand("Orbital")} ${cliTheme.brand.muted("AI Terminal")}`;
  const subtitle = chalk.dim(`Model ${env.googleModel}  •  Bun runtime`);

  return renderPanel(`${title}\n${subtitle}`, {
    tone: "system",
    title: cliTheme.brand.muted("Session"),
    margin: { top: 0, bottom: 1 },
  });
};

export const renderSessionBanner = (options: SessionBannerOptions) => {
  return renderPanel(
    `${chalk.bold(options.title)}\n${chalk.dim(options.subtitle)}\n\n${options.details.join("\n")}`,
    {
      title: cliTheme.brand.muted("Workspace"),
      tone: "default",
      margin: { top: 0, bottom: 1 },
    },
  );
};

export const renderCompactStatus = (parts: string[]) => {
  return `${renderRule()} \n${parts.join(chalk.dim("  •  "))}`;
};
