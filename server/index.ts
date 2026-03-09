import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import cors from 'cors';
import { auth } from './src/lib/auth';

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
)


app.use(express.json());

app.get("/api/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    console.log("Authorization header:", req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    return res.json(session);
  } catch (error: any) {
    console.error("Session error:", error);

    return res.status(500).json({
      error: "Failed to get session",
      details: error.message,
    });
  }
});


app.get("/health",(req, res) =>{
  res.send("OK")
})

app.get("/device", (req, res) => {
  console.log("DEVICE ROUTE HIT");

  const userCode = req.query.user_code as string | undefined
  
  res.redirect(
    302,
    `http://localhost:3000/device?user_code=${encodeURIComponent(userCode || "")}`
  )
})

app.all("/api/auth/*splat", toNodeHandler(auth))

app.listen(process.env.PORT,()=>{
  console.log(`Server is running on port ${process.env.PORT}`)
})