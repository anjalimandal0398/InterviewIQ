import express from "express";

import {
  generateInterviewQuestions,
  startInterview,
  evaluateInterview,
  getInterviewDashboard,
  getInterviewHistory,
  getInterviewById,
} from "../controllers/interview.controller.js";

import isAuth from "../middlewares/isAuth.js";

const interviewRouter = express.Router();

// =====================================================
// GENERATE AI INTERVIEW QUESTIONS
// =====================================================

interviewRouter.post(
  "/generate-questions",
  generateInterviewQuestions
);

// =====================================================
// START INTERVIEW
// =====================================================

interviewRouter.post(
  "/start",
  isAuth,
  startInterview
);

// =====================================================
// EVALUATE INTERVIEW
// =====================================================

interviewRouter.post(
  "/evaluate",
  isAuth,
  evaluateInterview
);

// =====================================================
// INTERVIEW DASHBOARD
// =====================================================

interviewRouter.get(
  "/dashboard",
  isAuth,
  getInterviewDashboard
);

// =====================================================
// INTERVIEW HISTORY
// =====================================================

interviewRouter.get(
  "/history",
  isAuth,
  getInterviewHistory
);

// =====================================================
// GET SINGLE INTERVIEW RESULT
// =====================================================

interviewRouter.get(
  "/:id",
  isAuth,
  getInterviewById
);

export default interviewRouter;