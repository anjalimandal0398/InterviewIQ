import { GoogleGenAI } from "@google/genai";
import { extractPdfText } from "../../config/resume/pdfExtractor.js";

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
- Extract the candidate's name, email and phone number if available.
- Extract education details if available.
- Extract project technologies if available.
- suggestedRoles should contain realistic job roles based on the candidate's actual skills and projects.
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
// UPLOAD + EXTRACT + ANALYZE RESUME
// =====================================================

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    // ---------------------------------------------
    // STEP 1: Extract text from PDF
    // ---------------------------------------------

    const resumeText = await extractPdfText(req.file.path);

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from this PDF",
      });
    }

    // ---------------------------------------------
    // STEP 2: Analyze extracted resume text using AI
    // ---------------------------------------------

    const analysis = await analyzeResumeText(resumeText);

    // ---------------------------------------------
    // STEP 3: Send complete response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully",

      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },

      resumeText,

      analysis,
    });
  } catch (error) {
    console.error("Resume Upload & Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload and analyze resume",
    });
  }
};


// =====================================================
// ANALYZE RESUME TEXT
// This endpoint is kept for testing/reuse.
// =====================================================

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body || {};

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const analysis = await analyzeResumeText(resumeText);

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
    });
  }
};