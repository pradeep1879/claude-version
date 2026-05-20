import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { router } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
