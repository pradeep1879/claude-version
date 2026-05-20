import chalk from "chalk";
import stringWidth from "string-width";
import { renderAssistantBubble, renderErrorBubble } from "../components/message";
import { cliTheme } from "../themes/theme";
import { clearPreviousRender, hideCursor, showCursor } from "../utils/terminal";

type AssistantStreamRenderer = {
  push: (chunk: string) => void;
  complete: (finalMessage: string) => void;
  fail: (message?: string) => void;
};

const FLUSH_INTERVAL_MS = 32;
const MIN_BUFFER_SIZE = 18;
const GUTTER = `${cliTheme.brand.secondary("│")} `;

const normalizeChunk = (chunk: string) => {
  return chunk.replace(/\r\n/g, "\n");
};

export const createAssistantStreamRenderer = (): AssistantStreamRenderer => {
  const terminalWidth = Math.max(72, Math.min(process.stdout.columns || 100, 140));
  const bodyWidth = Math.max(24, terminalWidth - stringWidth(GUTTER) - 4);
  let buffer = "";
  let fullText = "";
  let flushTimer: Timer | null = null;
  let started = false;
  let stopped = false;
  let renderedRows = 0;
  let currentRowWidth = 0;

  const begin = () => {
    if (started) {
      return;
    }

    started = true;
    hideCursor();
    process.stdout.write(`\n${cliTheme.roles.assistant("Assistant")} ${chalk.dim("›")}\n${GUTTER}`);
    renderedRows = 2;
    currentRowWidth = 0;
  };

  const writeChar = (character: string) => {
    if (character === "\n") {
      process.stdout.write(`\n${GUTTER}`);
      renderedRows += 1;
      currentRowWidth = 0;
      return;
    }

    const width = stringWidth(character);

    if (currentRowWidth + width > bodyWidth) {
      process.stdout.write(`\n${GUTTER}`);
      renderedRows += 1;
      currentRowWidth = 0;
    }

    process.stdout.write(character);
    currentRowWidth += width;
  };

  const clearTimer = () => {
    if (!flushTimer) {
      return;
    }

    clearTimeout(flushTimer);
    flushTimer = null;
  };

  const flush = (force = false) => {
    if (stopped || !started || buffer.length === 0) {
      return;
    }

    if (!force && buffer.length < MIN_BUFFER_SIZE && !/[\s.,!?;:\])}]/.test(buffer)) {
      return;
    }

    const nextText = fullText + buffer;
    const delta = nextText.slice(fullText.length);

    for (const character of delta) {
      writeChar(character);
    }

    fullText = nextText;
    buffer = "";
  };

  const scheduleFlush = () => {
    if (flushTimer || stopped) {
      return;
    }

    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();

      if (buffer.length > 0) {
        scheduleFlush();
      }
    }, FLUSH_INTERVAL_MS);
  };

  const replaceStreamRegion = (replacement: string) => {
    clearPreviousRender(renderedRows);
    process.stdout.write(`${replacement}\n`);
  };

  return {
    push: (chunk) => {
      if (stopped) {
        return;
      }

      begin();
      buffer += normalizeChunk(chunk);

      if (/[\s.,!?;:\])}]/.test(chunk) || buffer.length >= MIN_BUFFER_SIZE) {
        clearTimer();
        flush(true);
        return;
      }

      scheduleFlush();
    },
    complete: (finalMessage) => {
      if (stopped) {
        return;
      }

      begin();
      clearTimer();
      flush(true);
      stopped = true;
      replaceStreamRegion(renderAssistantBubble(finalMessage));
      showCursor();
    },
    fail: (message) => {
      if (stopped) {
        return;
      }

      begin();
      clearTimer();
      flush(true);
      stopped = true;
      replaceStreamRegion(renderErrorBubble(message || "Streaming failed."));
      showCursor();
    },
  };
};
