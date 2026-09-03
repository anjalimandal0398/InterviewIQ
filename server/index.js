import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/connectDb.js";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import resumeRouter from "./routes/resume/resume.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */

app.use(
  cors({
    origin: [
      // Local development
      "http://localhost:5173",

      // Vercel production domain
      "https://interview-iq-nine-mu.vercel.app",

      // Current Vercel deployment/preview domain
      "https://interview-c5lueb9ox-anjalimandal0398s-projects.vercel.app",
    ],
    credentials: true,
  })
);

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(cookieParser());

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/payment", paymentRouter);

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  connectDb();
});