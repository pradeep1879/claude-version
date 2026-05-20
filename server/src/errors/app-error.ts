export type AppError = Error & {
  statusCode: number;
  details?: unknown;
};

export const createAppError = (
  message: string,
  statusCode = 500,
  details?: unknown,
): AppError => {
  const error = new Error(message) as AppError;

  error.name = "AppError";
  error.statusCode = statusCode;
  error.details = details;

  return error;
};
