import express from "express";

import upload from "../../config/resume/multer.js";

import {
  uploadResume,
  analyzeResume,
} from "../../controllers/resume/resume.controller.js";

const resumeRouter = express.Router();


// Upload Resume
resumeRouter.post(
  "/upload",
  upload.single("resume"),
  uploadResume
);


// Analyze Resume
resumeRouter.post(
  "/analyze",
  analyzeResume
);


export default resumeRouter;