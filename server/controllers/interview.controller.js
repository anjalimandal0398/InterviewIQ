import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Interview from "../models/interview.js";

dotenv.config();


// =====================================================
// GENERATE INTERVIEW QUESTIONS
// =====================================================

export const generateInterviewQuestions = async (req, res) => {
  try {
    const {
      role,
      experience,
      difficulty,
      type,
      resumeText,
      resumeAnalysis,
    } = req.body;

    if (!role || !experience || !difficulty || !type) {
      return res.status(400).json({
        success: false,
        message: "All interview details are required",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    let interviewInstructions = "";

    // =====================================================
    // INTERVIEW TYPE
    // =====================================================

    if (type === "Technical") {
      interviewInstructions = `
Focus mainly on technical knowledge.

Ask questions related to:

- Programming fundamentals
- JavaScript
- React.js
- Node.js
- Express.js
- MongoDB
- APIs
- Authentication
- Database concepts
- Projects
- Problem solving

Questions should test actual technical understanding,
not just definitions.
`;
    }

    if (type === "HR") {
      interviewInstructions = `
Focus mainly on HR and behavioral questions.

Ask questions related to:

- Self introduction
- Strengths and weaknesses
- Career goals
- Teamwork
- Conflict handling
- Communication
- Problem solving
- Handling pressure
- Motivation
- Why should we hire you?
- Why this role?
- Situational questions

Questions should be suitable for a real HR interview.
`;
    }

    if (type === "Mixed") {
      interviewInstructions = `
Create a balanced interview containing both technical
and HR/behavioral questions.

Include:

- Technical concepts
- Projects
- Problem solving
- Communication
- Behavioral situations
- Career related questions

Maintain a reasonable balance between technical and HR questions.
`;
    }

    // =====================================================
    // RESUME INFORMATION
    // =====================================================

    let resumeInstructions = "";

    if (resumeAnalysis || resumeText) {
      resumeInstructions = `
The candidate has uploaded a resume.

Use the resume information to personalize the interview.

IMPORTANT:

- Ask questions based on skills actually present in the resume.
- Ask questions about projects mentioned in the resume.
- Ask questions about technologies mentioned in the resume.
- Ask questions from the interview focus areas identified from the resume.
- Do not invent experience that is not present in the resume.
- Do not ask about technologies that are completely unrelated to the resume.
- For project questions, ask practical questions about what the candidate actually built.

RESUME ANALYSIS:

${JSON.stringify(resumeAnalysis || {}, null, 2)}

RESUME TEXT:

${resumeText || "Not available"}
`;
    } else {
      resumeInstructions = `
No resume was uploaded.

Generate questions based on the selected job role,
experience level, difficulty and interview type.
`;
    }

    // =====================================================
    // AI PROMPT
    // =====================================================

    const prompt = `
You are an expert interviewer conducting a real job interview.

Candidate Job Role:
${role}

Experience Level:
${experience}

Difficulty:
${difficulty}

Interview Type:
${type}

${interviewInstructions}

${resumeInstructions}

Generate exactly 5 interview questions.

IMPORTANT RULES:

1. Questions must match the candidate's experience level.
2. Questions must match the selected difficulty.
3. Questions must match the interview type.
4. Avoid duplicate questions.
5. Questions should be practical and interview-oriented.
6. If resume information is available, personalize the questions using it.
7. Do not invent information about the candidate.
8. Keep questions clear and understandable.
9. Each question should test a meaningful skill.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not use code fences.

Return exactly this structure:

{
  "questions": [
    {
      "question": "Question here",
      "category": "Category here"
    }
  ]
}
`;

    // =====================================================
    // GEMINI
    // =====================================================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text;

    const cleanedResponse = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanedResponse);

    // =====================================================
    // VALIDATE QUESTIONS
    // =====================================================

    if (
      !data.questions ||
      !Array.isArray(data.questions) ||
      data.questions.length !== 5
    ) {
      return res.status(500).json({
        success: false,
        message: "AI did not generate exactly 5 questions",
      });
    }

    return res.status(200).json({
      success: true,
      questions: data.questions,
    });

  } catch (error) {
    console.error("Generate Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate interview questions",
    });
  }
};


// =====================================================
// START INTERVIEW
// =====================================================

export const startInterview = async (req, res) => {
  try {
    const {
      role,
      experience,
      difficulty,
      type,
      questions,
      resumeAnalysis,
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!role || !experience || !difficulty || !type) {
      return res.status(400).json({
        success: false,
        message: "Interview details are required",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Interview questions are required",
      });
    }

    const formattedQuestions = questions.map((item) => ({
      question: item.question,
      category: item.category || "Interview",
      answer: "",
      score: 0,
      feedback: "",
      timeTaken: 0,
    }));

    const interview = await Interview.create({
      user: req.userId,

      role,
      experience,
      difficulty,
      type,

      resumeBased: !!resumeAnalysis,
      resumeAnalysis: resumeAnalysis || null,

      questions: formattedQuestions,

      status: "incomplete",

      totalQuestions: formattedQuestions.length,
      answeredQuestions: 0,

      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Interview started successfully",

      interviewId: interview._id,

      interview,
    });

  } catch (error) {
    console.error("Start Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start interview",
    });
  }
};


// =====================================================
// EVALUATE INTERVIEW
// =====================================================

export const evaluateInterview = async (req, res) => {
  try {
    const {
      interviewId,
      role,
      experience,
      difficulty,
      type,
      answers,
      duration,
    } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    if (!role || !experience || !difficulty || !type || !answers) {
      return res.status(400).json({
        success: false,
        message: "Interview data is required",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one answer is required",
      });
    }

    // =====================================================
    // FIND INTERVIEW
    // =====================================================

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // =====================================================
    // AI
    // =====================================================

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's interview answers carefully.

Job Role:
${role}

Experience:
${experience}

Difficulty:
${difficulty}

Interview Type:
${type}

Candidate Answers:

${JSON.stringify(answers, null, 2)}

Evaluate each answer based on:

- Technical correctness
- Understanding
- Relevance
- Clarity
- Completeness
- Practical knowledge

Give every question a score out of 10.

Then calculate an overall score out of 100.

For a fresher, do not expect advanced professional-level answers.
Focus on conceptual correctness and understanding.

Also evaluate:

- Communication
- Correctness
- Confidence

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Return exactly this structure:

{
  "overallScore": 0,
  "communicationScore": 0,
  "correctnessScore": 0,
  "confidenceScore": 0,
  "overallFeedback": "",
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "questionEvaluations": [
    {
      "question": "",
      "category": "",
      "answer": "",
      "score": 0,
      "feedback": ""
    }
  ]
}
`;

    // =====================================================
    // GEMINI EVALUATION
    // =====================================================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text;

    const cleanedResponse = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const evaluation = JSON.parse(cleanedResponse);

    // =====================================================
    // UPDATE QUESTION RESULTS
    // =====================================================

    const evaluatedQuestions = evaluation.questionEvaluations || [];

    interview.questions = interview.questions.map((question, index) => {
      const evaluated = evaluatedQuestions[index];

      return {
        question: question.question,
        category: question.category,

        answer: evaluated?.answer || answers[index]?.answer || "",

        score:
          typeof evaluated?.score === "number"
            ? evaluated.score
            : 0,

        feedback: evaluated?.feedback || "",

        timeTaken:
          typeof answers[index]?.timeTaken === "number"
            ? answers[index].timeTaken
            : 0,
      };
    });

    // =====================================================
    // SAVE FINAL RESULT
    // =====================================================

    interview.status = "completed";

    interview.answeredQuestions = answers.length;

    interview.duration =
      typeof duration === "number" ? duration : 0;

    interview.overallScore =
      typeof evaluation.overallScore === "number"
        ? evaluation.overallScore
        : 0;

    interview.communicationScore =
      typeof evaluation.communicationScore === "number"
        ? evaluation.communicationScore
        : 0;

    interview.correctnessScore =
      typeof evaluation.correctnessScore === "number"
        ? evaluation.correctnessScore
        : 0;

    interview.confidenceScore =
      typeof evaluation.confidenceScore === "number"
        ? evaluation.confidenceScore
        : 0;

    interview.strengths = Array.isArray(evaluation.strengths)
      ? evaluation.strengths
      : [];

    interview.weaknesses = Array.isArray(evaluation.weaknesses)
      ? evaluation.weaknesses
      : [];

    interview.suggestions = Array.isArray(evaluation.suggestions)
      ? evaluation.suggestions
      : [];

    interview.completedAt = new Date();

    await interview.save();

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "Interview evaluated successfully",

      interviewId: interview._id,

      evaluation: {
        overallScore: interview.overallScore,
        communicationScore: interview.communicationScore,
        correctnessScore: interview.correctnessScore,
        confidenceScore: interview.confidenceScore,

        overallFeedback:
          evaluation.overallFeedback || "",

        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        suggestions: interview.suggestions,

        questionEvaluations: evaluatedQuestions,
      },
    });

  } catch (error) {
    console.error("Evaluate Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to evaluate interview",
    });
  }
};