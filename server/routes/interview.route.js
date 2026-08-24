import express from "express";

import {
  generateInterviewQuestions,
  startInterview,
  evaluateInterview,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

// =====================================================
// Generate AI interview questions
// =====================================================

interviewRouter.post(
  "/generate-questions",
  generateInterviewQuestions
);

// =====================================================
// Start interview and save it in MongoDB
// =====================================================

interviewRouter.post(
  "/start",
  startInterview
);

// =====================================================
// Evaluate interview answers using AI
// =====================================================

interviewRouter.post(
  "/evaluate",
  evaluateInterview
);

export default interviewRouter;