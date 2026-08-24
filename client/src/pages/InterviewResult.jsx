import React from "react";
import { motion } from "motion/react";
import {
  FaRobot,
  FaCheckCircle,
  FaArrowRight,
  FaHome,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const InterviewResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    interviewData = {},
    answers = [],
    totalQuestions = 0,
    duration = 0,
    evaluation = null,
  } = location.state || {};

  const completion = totalQuestions
    ? Math.round((answers.length / totalQuestions) * 100)
    : 0;

  const score = evaluation?.overallScore ?? 0;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const strengths = evaluation?.strengths || [];
  const weaknesses = evaluation?.weaknesses || [];
  const suggestions = evaluation?.suggestions || [];
  const questionEvaluations =
    evaluation?.questionEvaluations || [];

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <IoSparkles size={16} />
            Interview Completed
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Great Job! 🎉
          </h1>

          <p className="text-gray-500 mt-2">
            Here is your AI-powered interview evaluation.
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-black text-white rounded-3xl p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white text-black p-3 rounded-xl">
                  <FaRobot size={22} />
                </div>

                <div>
                  <p className="font-semibold">
                    InterviewIQ AI
                  </p>

                  <p className="text-gray-400 text-sm">
                    AI Interview Evaluation
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold">
                {interviewData.role || "Developer"} Interview
              </h2>

              <p className="text-gray-400 mt-2">
                {interviewData.experience || "Fresher"} •{" "}
                {interviewData.difficulty || "Medium"}
              </p>
            </div>

            {/* AI Score */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-green-500 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">
                  {score}
                </span>

                <span className="text-gray-400 text-sm">
                  / 100
                </span>
              </div>

              <p className="text-green-400 font-medium mt-3">
                AI Interview Score
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              Questions
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {answers.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Answered
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              Total Questions
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalQuestions}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Interview questions
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              Duration
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Time taken
            </p>
          </div>

        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 mb-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <FaCheckCircle size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Performance Overview
              </h2>

              <p className="text-sm text-gray-500">
                AI analysis of your interview
              </p>
            </div>
          </div>

          {/* Completion */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                Completion
              </span>

              <span className="font-semibold">
                {completion}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-green-500 rounded-full"
              />
            </div>
          </div>

          {/* Overall Feedback */}
          {evaluation?.overallFeedback && (
            <div className="bg-gray-50 rounded-2xl p-5 mb-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                Overall Feedback
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {evaluation.overallFeedback}
              </p>
            </div>
          )}

          {/* Strengths */}
          <div className="grid md:grid-cols-2 gap-5">

            <div className="bg-green-50 rounded-2xl p-5">
              <h3 className="font-semibold text-green-700 mb-3">
                Strengths
              </h3>

              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No strengths available.
                </p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-orange-50 rounded-2xl p-5">
              <h3 className="font-semibold text-orange-700 mb-3">
                Areas to Improve
              </h3>

              {weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {weaknesses.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No weaknesses available.
                </p>
              )}
            </div>

          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-2xl p-5 mt-5">
              <h3 className="font-semibold text-blue-700 mb-3">
                Improvement Suggestions
              </h3>

              <ul className="space-y-2">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Question Evaluations */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">

          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Question-wise Evaluation
          </h2>

          <div className="space-y-5">

            {answers.length > 0 ? (
              answers.map((item, index) => {

                const evaluationData =
                  questionEvaluations[index];

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-3">

                      <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1">

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                          <h3 className="font-semibold text-gray-900 leading-relaxed">
                            {item.question}
                          </h3>

                          {evaluationData && (
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                              {evaluationData.score}/100
                            </div>
                          )}

                        </div>

                        <p className="text-xs text-green-600 mt-2">
                          {item.category || "Interview"}
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mt-4">
                          <p className="text-xs text-gray-400 mb-2">
                            YOUR ANSWER
                          </p>

                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.answer}
                          </p>
                        </div>

                        {evaluationData?.feedback && (
                          <div className="bg-blue-50 rounded-xl p-4 mt-3">
                            <p className="text-xs text-blue-600 font-medium mb-2">
                              AI FEEDBACK
                            </p>

                            <p className="text-gray-600 text-sm leading-relaxed">
                              {evaluationData.feedback}
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">
                No answers found.
              </p>
            )}

          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-7 py-3 bg-white border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <FaHome size={14} />
            Back to Home
          </button>

          <button
            onClick={() => navigate("/interview/config")}
            className="flex items-center justify-center gap-2 px-7 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
          >
            Start New Interview
            <FaArrowRight size={14} />
          </button>

        </div>

      </div>
    </div>
  );
};

export default InterviewResult;