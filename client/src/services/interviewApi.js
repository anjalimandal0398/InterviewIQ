import axios from "axios";
import { ServerUrl } from "../App";

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
// CREATE INTERVIEW
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

export default interviewApi;