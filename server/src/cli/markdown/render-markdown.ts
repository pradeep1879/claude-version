import chalk from "chalk";
import { highlight } from "cli-highlight";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import { getTerminalWidth } from "../utils/terminal";

let markdownConfigured = false;

const highlightCode = (code: string, language?: string) => {
  try {
    return highlight(code, {
      language: language || "plaintext",
      ignoreIllegals: true,
      theme: {
        keyword: chalk.hex("#c084fc"),
        built_in: chalk.hex("#93c5fd"),
        string: chalk.hex("#86efac"),
        number: chalk.hex("#fdba74"),
        literal: chalk.hex("#f9a8d4"),
        comment: chalk.hex("#64748b"),
      },
    });
  } catch {
    return chalk.cyan(code);
  }
};

const configureMarkdown = () => {
  if (markdownConfigured) {
    return;
  }

  marked.use(
    markedTerminal({
      width: Math.min(getTerminalWidth() - 10, 90),
      reflowText: true,
      showSectionPrefix: false,
      code: (code: string, language?: string) => highlightCode(code, language),
      blockquote: chalk.hex("#94a3b8").italic,
      heading: chalk.hex("#e2e8f0").bold,
      firstHeading: chalk.hex("#7dd3fc").bold,
      strong: chalk.bold,
      em: chalk.italic,
      codespan: chalk.hex("#fde68a"),
      link: chalk.hex("#93c5fd").underline,
      tableOptions: {
        style: {
          head: ["cyan"],
          border: ["gray"],
        },
      },
    }),
  );

  markdownConfigured = true;
};

export const renderMarkdown = (value: string) => {
  configureMarkdown();
  const rendered = marked.parse(value);

  return typeof rendered === "string" ? rendered.trim() : String(rendered).trim();
};
