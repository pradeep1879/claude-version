import chalk from "chalk";

export const cliTheme = {
  brand: {
    primary: chalk.hex("#7dd3fc"),
    secondary: chalk.hex("#a5b4fc"),
    accent: chalk.hex("#f9a8d4"),
    muted: chalk.hex("#94a3b8"),
    subtle: chalk.hex("#64748b"),
    success: chalk.hex("#86efac"),
    warning: chalk.hex("#fcd34d"),
    danger: chalk.hex("#fca5a5"),
    surface: chalk.hex("#0f172a"),
    ink: chalk.hex("#e2e8f0"),
  },
  roles: {
    user: chalk.hex("#38bdf8"),
    assistant: chalk.hex("#a78bfa"),
    system: chalk.hex("#f59e0b"),
    tool: chalk.hex("#22c55e"),
    error: chalk.hex("#fb7185"),
  },
};

export const formatBrand = (value: string) => {
  const colors = [
    cliTheme.brand.primary,
    cliTheme.brand.secondary,
    cliTheme.brand.accent,
  ] as const;

  return value
    .split("")
    .map((character, index) => {
      const color = colors[index % colors.length] ?? cliTheme.brand.primary;

      return color(character);
    })
    .join("");
};
