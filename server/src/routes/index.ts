import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { asyncHandler } from "../lib/async-handler";
import { auth } from "../lib/auth";
import { getSessionFromAccessToken } from "../modules/auth/auth-http.service";
import { env } from "../config/env";

const router = Router();

router.get(
  "/api/me",
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const session = await getSessionFromAccessToken(token);

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    return res.json(session);
  }),
);

router.get("/health", (_req, res) => {
  res.send("OK");
});

router.get("/device", (req, res) => {
  const userCode =
    typeof req.query.user_code === "string" ? req.query.user_code : "";

  res.redirect(
    302,
    `${env.clientUrl}/device?user_code=${encodeURIComponent(userCode)}`,
  );
});

router.all("/api/auth/*splat", toNodeHandler(auth));

export { router };
