import React, { useEffect, useMemo, useState } from "react";

import { motion } from "motion/react";

import {
  FaArrowLeft,
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCode,
  FaExclamationCircle,
  FaFileAlt,
  FaHistory,
  FaPlay,
  FaRobot,
  FaTrophy,
  FaUserTie,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import { ServerUrl } from "../App";

const InterviewHistory = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH INTERVIEW HISTORY
  // =====================================================

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${ServerUrl}/api/interview/history`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setInterviews(response.data.interviews || []);
      } else {
        setError(
          response.data.message ||
            "Unable to load interview history."
        );
      }
    } catch (error) {
      console.error(
        "Interview History Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load interview history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) {
      return "0 min";
    }

    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  // =====================================================
  // SCORE COLOR
  // =====================================================

  const getScoreText = (score) => {
    const value = Number(score || 0);

    if (value >= 85) {
      return "text-green-600";
    }

    if (value >= 70) {
      return "text-blue-600";
    }

    if (value >= 50) {
      return "text-orange-500";
    }

    return "text-red-500";
  };

  // =====================================================
  // SCORE LABEL
  // =====================================================

  const getScoreLabel = (score) => {
    const value = Number(score || 0);

    if (value >= 90) return "Excellent";
    if (value >= 80) return "Very Good";
    if (value >= 70) return "Good";
    if (value >= 50) return "Needs Practice";

    return "Needs Improvement";
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (interview) => {
    if (interview.status === "completed") {
      return {
        label: "Completed",
        className:
          "bg-green-50 text-green-700 border-green-200",
      };
    }

    return {
      label: "Incomplete",
      className:
        "bg-orange-50 text-orange-700 border-orange-200",
    };
  };

  // =====================================================
  // FILTER COUNTS
  // =====================================================

  const statistics = useMemo(() => {
    const completed = interviews.filter(
      (item) => item.status === "completed"
    ).length;

    const incomplete = interviews.filter(
      (item) => item.status !== "completed"
    ).length;

    const scores = interviews
      .filter(
        (item) =>
          item.status === "completed" &&
          typeof item.overallScore === "number"
      )
      .map((item) => item.overallScore);

    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce((a, b) => a + b, 0) /
              scores.length
          )
        : 0;

    return {
      total: interviews.length,
      completed,
      incomplete,
      average,
    };
  }, [interviews]);

  // =====================================================
  // VIEW RESULT
  // =====================================================

  const handleViewResult = (id) => {
    if (!id) {
      console.error("Interview ID missing");
      return;
    }

    // Open InterviewResult using path parameter
    navigate(`/interview/result/${id}`);
  };

  // =====================================================
  // CONTINUE INTERVIEW
  // =====================================================

  const handleContinue = (id) => {
    if (!id) {
      console.error("Interview ID missing");
      return;
    }

    // Keep same result-page URL structure
    navigate(`/interview/result/${id}`);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-xl w-48 mb-8" />

            <div className="bg-white rounded-3xl p-8 border border-gray-200">
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-3" />
              <div className="h-4 bg-gray-200 rounded-lg w-96" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl h-28 border border-gray-200"
                />
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-3xl h-48 border border-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 mb-6 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
          >
            <FaArrowLeft size={14} />
            Back to Dashboard
          </button>

          <div className="bg-white border border-red-200 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FaExclamationCircle size={26} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unable to Load Interview History
            </h2>

            <p className="text-gray-500 mb-6">
              {error}
            </p>

            <button
              onClick={fetchInterviewHistory}
              className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 mb-7 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <FaArrowLeft size={14} />
          Back to Dashboard
        </motion.button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-gray-200 rounded-3xl p-7 md:p-9 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                <FaHistory size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Interview History
                </h1>

                <p className="text-gray-500 mt-1">
                  Track and review all your AI interview sessions
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/interview/config")
              }
              className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              <FaPlay size={12} />
              Start New Interview
            </button>
          </div>
        </motion.div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

          {/* Total */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <FaHistory className="text-gray-700" />
            </div>

            <p className="text-sm text-gray-500">
              Total Interviews
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {statistics.total}
            </p>
          </motion.div>

          {/* Completed */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <FaCheckCircle className="text-green-600" />
            </div>

            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {statistics.completed}
            </p>
          </motion.div>

          {/* Incomplete */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <FaClock className="text-orange-500" />
            </div>

            <p className="text-sm text-gray-500">
              Incomplete
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {statistics.incomplete}
            </p>
          </motion.div>

          {/* Average */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <FaTrophy className="text-blue-600" />
            </div>

            <p className="text-sm text-gray-500">
              Average Score
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {statistics.average}
              <span className="text-sm text-gray-400">
                /100
              </span>
            </p>
          </motion.div>
        </div>

        {/* =====================================================
            NO HISTORY
        ===================================================== */}

        {interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-3xl p-10 md:p-16 text-center mt-6 shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaRobot
                size={32}
                className="text-gray-400"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Interviews Yet
            </h2>

            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-7">
              You haven't completed any AI interviews yet.
              Start your first interview and your complete
              performance history will appear here.
            </p>

            <button
              onClick={() =>
                navigate("/interview/config")
              }
              className="inline-flex items-center gap-2 px-7 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
            >
              <FaPlay size={12} />
              Start Your First Interview
            </button>
          </motion.div>
        ) : (
          <>
            {/* =====================================================
                SECTION TITLE
            ===================================================== */}

            <div className="flex items-center justify-between mt-8 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Your Interviews
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Most recent interviews appear first
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <FaHistory size={13} />
                {interviews.length} sessions
              </div>
            </div>

            {/* =====================================================
                INTERVIEW LIST
            ===================================================== */}

            <div className="space-y-5">
              {interviews.map((interview, index) => {
                const status = getStatus(interview);

                const score =
                  Number(interview.overallScore) || 0;

                const answered =
                  Number(interview.answeredQuestions) || 0;

                const total =
                  Number(interview.totalQuestions) || 0;

                const completion =
                  total > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (answered / total) * 100
                        )
                      )
                    : 0;

                return (
                  <motion.div
                    key={interview._id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: Math.min(
                        index * 0.05,
                        0.3
                      ),
                    }}
                    className="bg-white border border-gray-200 rounded-3xl p-6 md:p-7 shadow-sm hover:shadow-md transition"
                  >
                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                      <div className="flex items-start gap-4">

                        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                          {interview.type ===
                          "Technical" ? (
                            <FaCode size={19} />
                          ) : interview.type ===
                            "HR" ? (
                            <FaUserTie size={19} />
                          ) : (
                            <FaRobot size={19} />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-lg md:text-xl font-bold text-gray-900">
                              {interview.role ||
                                "AI Interview"}
                            </h3>

                            {interview.resumeBased && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium">
                                <FaFileAlt size={10} />
                                Resume Based
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">

                            <span className="flex items-center gap-1.5">
                              <FaBriefcase size={12} />
                              {interview.type ||
                                "Interview"}
                            </span>

                            <span>
                              {interview.experience ||
                                "Fresher"}
                            </span>

                            <span>
                              {interview.difficulty ||
                                "Medium"}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <FaCalendarAlt size={11} />
                              {formatDate(
                                interview.completedAt ||
                                  interview.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SCORE */}

                      <div className="flex items-center gap-4">

                        <div className="text-left lg:text-right">

                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Score
                          </p>

                          <p
                            className={`text-3xl font-bold ${getScoreText(
                              score
                            )}`}
                          >
                            {score}

                            <span className="text-sm text-gray-400 font-medium">
                              /100
                            </span>
                          </p>

                          <p
                            className={`text-xs font-medium ${getScoreText(
                              score
                            )}`}
                          >
                            {getScoreLabel(score)}
                          </p>
                        </div>

                        <div
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </div>
                      </div>
                    </div>

                    {/* DIVIDER */}

                    <div className="border-t border-gray-100 my-5" />

                    {/* STATS */}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Questions
                        </p>

                        <p className="font-semibold text-gray-800">
                          {answered} / {total}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Completion
                        </p>

                        <p className="font-semibold text-gray-800">
                          {completion}%
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Duration
                        </p>

                        <p className="font-semibold text-gray-800">
                          {formatDuration(
                            interview.duration
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Interview Type
                        </p>

                        <p className="font-semibold text-gray-800">
                          {interview.type ||
                            "Technical"}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-5">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-xs text-gray-500">
                          Interview Completion
                        </span>

                        <span className="text-xs font-medium text-gray-700">
                          {completion}%
                        </span>
                      </div>

                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-black rounded-full transition-all duration-500"
                          style={{
                            width: `${completion}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* BOTTOM */}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">

                      <div className="flex items-center gap-2 text-sm text-gray-500">

                        <FaTrophy
                          size={13}
                          className="text-gray-400"
                        />

                        <span>
                          {interview.overallFeedback
                            ? interview.overallFeedback.length >
                              80
                              ? interview.overallFeedback.slice(
                                  0,
                                  80
                                ) + "..."
                              : interview.overallFeedback
                            : "View your complete AI evaluation"}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleViewResult(
                            interview._id
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
                      >
                        View Result

                        <FaArrowLeft
                          size={12}
                          className="rotate-180"
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
