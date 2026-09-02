import axios from "axios";

const ServerUrl = "http://localhost:8000";

const interviewApi = axios.create({
  baseURL: ServerUrl + "/api/interview",
  withCredentials: true,
});

// =====================================================
// GENERATE QUESTIONS
// =====================================================

export const generateInterviewQuestions = async (data) => {
  const response = await interviewApi.post(
    "/generate-questions",
    data
  );

  return response.data;
};

// =====================================================
// CREATE / START INTERVIEW
// =====================================================

export const createInterview = async (data) => {
  const response = await interviewApi.post(
    "/create",
    data
  );

  return response.data;
};

// =====================================================
// EVALUATE INTERVIEW
// =====================================================

export const evaluateInterview = async (data) => {
  const response = await interviewApi.post(
    "/evaluate",
    data
  );

  return response.data;
};

// =====================================================
// GET INTERVIEW HISTORY
// =====================================================

export const getInterviewHistory = async () => {
  const response = await interviewApi.get(
    "/history"
  );

  return response.data;
};

export default interviewApi;