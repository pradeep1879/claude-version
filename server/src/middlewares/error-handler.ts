import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../errors/app-error";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const appError = error as Partial<AppError> | undefined;

  if (appError?.name === "AppError" && typeof appError.statusCode === "number") {
    return res.status(appError.statusCode).json({
      error: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    });
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  return res.status(500).json({
    error: "Internal server error",
    details: message,
  });
};
