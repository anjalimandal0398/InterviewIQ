import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Interview from "../models/interview.js";
import User from "../models/user.js";


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

Questions should test actual technical understanding.
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
`;
    }

    let resumeInstructions = "";

    if (resumeAnalysis || resumeText) {
      resumeInstructions = `
The candidate has uploaded a resume.

Use the resume information to personalize the interview.

IMPORTANT:
- Ask questions based on skills actually present in the resume.
- Ask questions about projects mentioned in the resume.
- Ask questions about technologies mentioned in the resume.
- Do not invent experience.
- Do not ask about completely unrelated technologies.
- Ask practical questions about projects.

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
3. Questions must match the selected interview type.
4. Avoid duplicate questions.
5. Questions should be practical and interview-oriented.
6. Personalize questions using resume information when available.
7. Do not invent candidate information.
8. Keep questions clear and understandable.
9. Each question should test a meaningful skill.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not use code fences.

Return exactly:

{
  "questions": [
    {
      "question": "Question here",
      "category": "Category here"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "";

    const cleanedResponse = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanedResponse);

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
    // VALIDATE INTERVIEW DETAILS
    // =====================================================

    if (!role || !experience || !difficulty || !type) {
      return res.status(400).json({
        success: false,
        message: "Interview details are required",
      });
    }

    // =====================================================
    // VALIDATE QUESTIONS
    // =====================================================

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Interview questions are required",
      });
    }

    // =====================================================
    // INTERVIEW CREDIT COST
    // =====================================================

    const INTERVIEW_COST = 10;

    // =====================================================
    // CHECK + DEDUCT CREDITS ATOMICALLY
    // =====================================================

    const user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        credits: { $gte: INTERVIEW_COST },
      },
      {
        $inc: {
          credits: -INTERVIEW_COST,
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
        requiredCredits: INTERVIEW_COST,
        availableCredits: currentUser.credits,
        shouldBuyCredits: true,
      });
    }

    // =====================================================
    // FORMAT QUESTIONS
    // =====================================================

    const formattedQuestions = questions.map((item) => ({
      question: item.question,
      category: item.category || "Interview",
      answer: "",
      score: 0,
      feedback: "",
      timeTaken: 0,
    }));

    // =====================================================
    // CREATE INTERVIEW
    // =====================================================

    try {
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

      // =====================================================
      // SUCCESS RESPONSE
      // =====================================================

      return res.status(201).json({
        success: true,
        message: "Interview started successfully",
        interviewId: interview._id,
        remainingCredits: user.credits,
        creditsUsed: INTERVIEW_COST,
        interview,
      });
    } catch (interviewError) {
      // =====================================================
      // REFUND CREDIT IF INTERVIEW CREATION FAILS
      // =====================================================

      console.error(
        "Interview Creation Error:",
        interviewError
      );

      await User.findByIdAndUpdate(req.userId, {
        $inc: {
          credits: INTERVIEW_COST,
        },
      });

      return res.status(500).json({
        success: false,
        message: "Failed to start interview. Credits have been refunded.",
      });
    }
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

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!role || !experience || !difficulty || !type) {
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

    let interview = null;

    if (interviewId) {
      interview = await Interview.findOne({
        _id: interviewId,
        user: req.userId,
      });
    }

    // =====================================================
    // CREATE INTERVIEW IF NOT FOUND
    // =====================================================

    if (!interview) {
      const questionsForInterview = answers.map((item) => ({
        question: item.question,
        category: item.category || "Interview",
        answer: item.answer || "",
        score: 0,
        feedback: "",
        timeTaken:
          typeof item.timeTaken === "number"
            ? item.timeTaken
            : 0,
      }));

      interview = await Interview.create({
        user: req.userId,
        role,
        experience,
        difficulty,
        type,
        questions: questionsForInterview,
        totalQuestions: questionsForInterview.length,
        answeredQuestions: answers.filter(
          (item) => item.answer?.trim()
        ).length,
        status: "incomplete",
        startedAt: new Date(),
      });
    }

    // =====================================================
    // GEMINI EVALUATION
    // =====================================================

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert interviewer evaluating a real job interview.

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

Evaluate every answer carefully.

For every question give a score from 0 to 100.

Scoring should consider:
- Technical correctness
- Understanding
- Relevance
- Clarity
- Completeness
- Practical knowledge
- Communication
- Confidence

For a fresher, do not expect advanced professional-level answers.

Calculate:
- overallScore out of 100
- communicationScore out of 100
- correctnessScore out of 100
- confidenceScore out of 100

Give useful and realistic feedback.

Return ONLY valid JSON.

Return exactly:

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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "";

    const cleanedResponse = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const evaluation = JSON.parse(cleanedResponse);

    // =====================================================
    // SCORE NORMALIZER
    // =====================================================

    const normalizeScore = (value) => {
      const score = Number(value);

      if (Number.isNaN(score)) {
        return 0;
      }

      return Math.max(0, Math.min(100, score));
    };

    const evaluatedQuestions =
      Array.isArray(evaluation.questionEvaluations)
        ? evaluation.questionEvaluations
        : [];

    // =====================================================
    // UPDATE QUESTIONS
    // =====================================================

    interview.questions = interview.questions.map(
      (question, index) => {
        const evaluated = evaluatedQuestions[index];
        const submittedAnswer = answers[index];

        return {
          question: question.question,

          category:
            question.category ||
            submittedAnswer?.category ||
            evaluated?.category ||
            "Interview",

          answer:
            submittedAnswer?.answer ||
            evaluated?.answer ||
            "",

          score: normalizeScore(evaluated?.score),

          feedback: evaluated?.feedback || "",

          timeTaken:
            typeof submittedAnswer?.timeTaken === "number"
              ? submittedAnswer.timeTaken
              : 0,
        };
      }
    );

    // =====================================================
    // SAVE RESULT
    // =====================================================

    interview.status = "completed";

    interview.answeredQuestions = answers.filter(
      (item) => item.answer?.trim()
    ).length;

    interview.duration =
      typeof duration === "number" ? duration : 0;

    interview.overallScore = normalizeScore(
      evaluation.overallScore
    );

    interview.communicationScore = normalizeScore(
      evaluation.communicationScore
    );

    interview.correctnessScore = normalizeScore(
      evaluation.correctnessScore
    );

    interview.confidenceScore = normalizeScore(
      evaluation.confidenceScore
    );

    interview.overallFeedback =
      evaluation.overallFeedback || "";

    interview.strengths = Array.isArray(
      evaluation.strengths
    )
      ? evaluation.strengths
      : [];

    interview.weaknesses = Array.isArray(
      evaluation.weaknesses
    )
      ? evaluation.weaknesses
      : [];

    interview.suggestions = Array.isArray(
      evaluation.suggestions
    )
      ? evaluation.suggestions
      : [];

    interview.completedAt = new Date();

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview evaluated successfully",
      interviewId: interview._id,

      evaluation: {
        overallScore: interview.overallScore,
        communicationScore:
          interview.communicationScore,
        correctnessScore:
          interview.correctnessScore,
        confidenceScore:
          interview.confidenceScore,

        overallFeedback:
          interview.overallFeedback,

        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        suggestions: interview.suggestions,

        questionEvaluations:
          interview.questions.map((item) => ({
            question: item.question,
            category: item.category,
            answer: item.answer,
            score: item.score,
            feedback: item.feedback,
          })),
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

// =====================================================
// DASHBOARD STATS
// =====================================================

export const getInterviewDashboard = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const interviews = await Interview.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalInterviews = interviews.length;

    const completedInterviews = interviews.filter(
      (item) => item.status === "completed"
    );

    const completedCount = completedInterviews.length;

    const averageScore =
      completedCount > 0
        ? completedInterviews.reduce(
            (sum, item) => sum + (item.overallScore || 0),
            0
          ) / completedCount
        : 0;

    const latestCompleted =
      completedInterviews.length > 0
        ? completedInterviews[0]
        : null;

    const performance = {
      technicalSkills: latestCompleted?.correctnessScore || 0,
      communication: latestCompleted?.communicationScore || 0,
      confidence: latestCompleted?.confidenceScore || 0,
      correctness: latestCompleted?.correctnessScore || 0,
    };

    const recentInterviews = interviews
      .slice(0, 5)
      .map((item) => ({
        _id: item._id,
        role: item.role,
        type: item.type,
        difficulty: item.difficulty,
        experience: item.experience,
        status: item.status,
        overallScore: item.overallScore || 0,
        totalQuestions: item.totalQuestions || 0,
        answeredQuestions: item.answeredQuestions || 0,
        duration: item.duration || 0,
        startedAt: item.startedAt,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
      }));

    return res.status(200).json({
      success: true,

      stats: {
        totalInterviews,
        completedInterviews: completedCount,
        averageScore: Number(averageScore.toFixed(1)),
      },

      performance,

      recentInterviews,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load interview dashboard",
    });
  }
};


// =====================================================
// GET SINGLE INTERVIEW RESULT
// =====================================================

export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const interview = await Interview.findOne({
      _id: id,
      user: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview result",
    });
  }
};

// =====================================================
// GET ALL INTERVIEW HISTORY
// =====================================================

export const getInterviewHistory = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const interviews = await Interview.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .select(
        "role experience difficulty type resumeBased status totalQuestions answeredQuestions duration overallScore communicationScore correctnessScore confidenceScore overallFeedback strengths weaknesses suggestions startedAt completedAt createdAt"
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Interview History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview history",
    });
  }
};