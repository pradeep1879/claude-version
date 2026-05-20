const ANSI_PATTERN =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI stripping for terminal layout
  /\u001B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

export const getTerminalWidth = () => {
  return Math.max(72, Math.min(process.stdout.columns || 100, 140));
};

export const stripAnsi = (value: string) => value.replace(ANSI_PATTERN, "");

export const countRenderableLines = (value: string) => {
  return stripAnsi(value).split("\n").length;
};

export const clearPreviousRender = (lineCount: number) => {
  if (lineCount <= 0) {
    return;
  }

  process.stdout.write(`\u001B[${lineCount}F\u001B[0J`);
};

export const hideCursor = () => {
  process.stdout.write("\u001B[?25l");
};

export const showCursor = () => {
  process.stdout.write("\u001B[?25h");
};

export const estimateTokenCount = (value: string) => {
  return Math.max(1, Math.round(value.trim().length / 4));
};
