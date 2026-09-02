import express from "express";
import upload from "../../config/resume/multer.js";
import isAuth from "../../middlewares/isAuth.js";

import {
  uploadResume,
  analyzeResume,
  getMyResume,
  getMyResumeHistory,
} from "../../controllers/resume/resume.controller.js";

const resumeRouter = express.Router();

// =====================================================
// UPLOAD + ANALYZE RESUME
// =====================================================

resumeRouter.post(
  "/upload",
  isAuth,
  upload.single("resume"),
  uploadResume
);

// =====================================================
// ANALYZE RESUME TEXT
// =====================================================

resumeRouter.post(
  "/analyze",
  isAuth,
  analyzeResume
);

// =====================================================
// GET LATEST RESUME
// =====================================================

resumeRouter.get(
  "/my-resume",
  isAuth,
  getMyResume
);

// =====================================================
// GET RESUME HISTORY
// =====================================================

resumeRouter.get(
  "/history",
  isAuth,
  getMyResumeHistory
);

export default resumeRouter;