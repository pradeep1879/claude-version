import { createAppError } from "../errors/app-error";

export const unauthorized = (message: string) => createAppError(message, 401);
