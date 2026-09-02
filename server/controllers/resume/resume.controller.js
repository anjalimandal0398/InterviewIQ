import { GoogleGenAI } from "@google/genai";

import { extractPdfText } from "../../config/resume/pdfExtractor.js";

import Resume from "../../models/resume/resume.model.js";
import User from "../../models/user.js";

// =====================================================
// GEMINI RESUME ANALYSIS
// =====================================================

const analyzeResumeText = async (resumeText) => {
  
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an expert technical recruiter and resume analyst.

Analyze the following resume carefully.

RESUME:

${resumeText}

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

Return exactly this structure:

{
  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },

  "professionalSummary": "",

  "experienceLevel": "",

  "skills": {
    "programmingLanguages": [],
    "frontend": [],
    "backend": [],
    "databases": [],
    "tools": [],
    "coreConcepts": []
  },

  "projects": [
    {
      "name": "",
      "technologies": [],
      "description": ""
    }
  ],

  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "score": ""
    }
  ],

  "certifications": [],

  "suggestedRoles": [],

  "interviewFocusAreas": []
}

Rules:

- Extract information only from the resume.
- Do not invent experience, skills, education or projects.
- Identify the candidate's actual experience level.
- Extract candidate name, email, phone and location if available.
- Extract education details if available.
- Extract project technologies if available.
- suggestedRoles should contain realistic job roles based on actual skills and projects.
- interviewFocusAreas should contain important areas that should be tested in an interview.
- Keep descriptions concise.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const text = response.text;

  const cleanedResponse = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);
};

// =====================================================
// UPLOAD + EXTRACT + ANALYZE + SAVE RESUME
// =====================================================

export const uploadResume = async (req, res) => {
  const RESUME_ANALYSIS_COST = 20;
  let creditsDeducted = false;

  try {
    // =====================================================
    // AUTHENTICATION CHECK
    // =====================================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // =====================================================
    // FILE CHECK
    // =====================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    // =====================================================
    // CHECK + DEDUCT 20 CREDITS
    // =====================================================

    const user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        credits: { $gte: RESUME_ANALYSIS_COST },
      },
      {
        $inc: {
          credits: -RESUME_ANALYSIS_COST,
        },
      },
      {
        returnDocument: "after",
      }
    );

    // =====================================================
    // INSUFFICIENT CREDITS
    // =====================================================

    if (!user) {
      const currentUser = await User.findById(req.userId);

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(402).json({
        success: false,
        message: "Insufficient credits",
        requiredCredits: RESUME_ANALYSIS_COST,
        availableCredits: currentUser.credits,
        shouldBuyCredits: true,
      });
    }

    creditsDeducted = true;

    // =====================================================
    // STEP 1: Extract PDF text
    // =====================================================

    const resumeText = await extractPdfText(req.file.path);

    if (!resumeText || !resumeText.trim()) {
      throw new Error("Could not extract text from this PDF");
    }

    // =====================================================
    // STEP 2: Analyze resume using Gemini
    // =====================================================

    const analysis = await analyzeResumeText(resumeText);

    // =====================================================
    // STEP 3: Save resume in MongoDB
    // =====================================================

    const resume = await Resume.create({
      user: req.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      resumeText,
      analysis,
    });

    // =====================================================
    // STEP 4: Send response
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      creditsUsed: RESUME_ANALYSIS_COST,
      remainingCredits: user.credits,
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        filePath: resume.filePath,
        fileSize: resume.fileSize,
      },
      resumeText,
      analysis,
    });
  } catch (error) {
    console.error("Resume Upload & Analysis Error:", error);

    // =====================================================
    // REFUND CREDITS IF ANALYSIS FAILED
    // =====================================================

    if (creditsDeducted) {
      try {
        await User.findByIdAndUpdate(req.userId, {
          $inc: {
            credits: RESUME_ANALYSIS_COST,
          },
        });

        console.log(
          `Refunded ${RESUME_ANALYSIS_COST} credits to user ${req.userId}`
        );
      } catch (refundError) {
        console.error("Resume Credit Refund Error:", refundError);
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload and analyze resume. Credits have been refunded.",
      error: error.message,
    });
  }
};

// =====================================================
// ANALYZE RESUME TEXT
// =====================================================

export const analyzeResume = async (req, res) => {
  const RESUME_ANALYSIS_COST = 20;
  let creditsDeducted = false;

  try {
    // =====================================================
    // AUTHENTICATION CHECK
    // =====================================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const { resumeText } = req.body || {};

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    // =====================================================
    // CHECK + DEDUCT 20 CREDITS
    // =====================================================

    const user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        credits: { $gte: RESUME_ANALYSIS_COST },
      },
      {
        $inc: {
          credits: -RESUME_ANALYSIS_COST,
        },
      },
      {
        returnDocument: "after",
      }
    );

    // =====================================================
    // INSUFFICIENT CREDITS
    // =====================================================

    if (!user) {
      const currentUser = await User.findById(req.userId);

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(402).json({
        success: false,
        message: "Insufficient credits",
        requiredCredits: RESUME_ANALYSIS_COST,
        availableCredits: currentUser.credits,
        shouldBuyCredits: true,
      });
    }

    creditsDeducted = true;

    // =====================================================
    // GEMINI ANALYSIS
    // =====================================================

    const analysis = await analyzeResumeText(resumeText);

    // =====================================================
    // SUCCESS
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      creditsUsed: RESUME_ANALYSIS_COST,
      remainingCredits: user.credits,
      analysis,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);

    // =====================================================
    // REFUND IF ANALYSIS FAILED
    // =====================================================

    if (creditsDeducted) {
      try {
        await User.findByIdAndUpdate(req.userId, {
          $inc: {
            credits: RESUME_ANALYSIS_COST,
          },
        });

        console.log(
          `Refunded ${RESUME_ANALYSIS_COST} credits to user ${req.userId}`
        );
      } catch (refundError) {
        console.error("Resume Credit Refund Error:", refundError);
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to analyze resume. Credits have been refunded.",
      error: error.message,
    });
  }
};

// =====================================================
// GET LATEST RESUME
// =====================================================

export const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.userId,
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get resume",
      error: error.message,
    });
  }
};

// =====================================================
// GET RESUME HISTORY
// =====================================================

export const getMyResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .select(
        "originalName fileName fileSize analysis createdAt"
      );

    return res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.error("Resume History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get resume history",
      error: error.message,
    });
  }
};