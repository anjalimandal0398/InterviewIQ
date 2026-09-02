import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  FaRobot,
  FaArrowRight,
  FaHistory,
  FaFileAlt,
  FaChartLine,
  FaMicrophone,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";

const Dashboard = () => {
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalInterviews: 0,
      completedInterviews: 0,
      averageScore: 0,
    },

    performance: {
      technicalSkills: 0,
      communication: 0,
      confidence: 0,
      correctness: 0,
    },

    recentInterviews: [],
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const result = await axios.get(
        ServerUrl + "/api/interview/dashboard",
        {
          withCredentials: true,
        }
      );

      if (result.data.success) {
        setDashboardData({
          stats: result.data.stats || {
            totalInterviews: 0,
            completedInterviews: 0,
            averageScore: 0,
          },

          performance: result.data.performance || {
            technicalSkills: 0,
            communication: 0,
            confidence: 0,
            correctness: 0,
          },

          recentInterviews:
            result.data.recentInterviews || [],
        });
      }
    } catch (error) {
      console.log(
        "Dashboard Error:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATS
  // =====================================================

  const stats = [
    {
      title: "Total Interviews",
      value: dashboardData.stats.totalInterviews,
      icon: FaHistory,
      description: "Interviews taken",
    },

    {
      title: "Completed",
      value: dashboardData.stats.completedInterviews,
      icon: FaChartLine,
      description: "Completed interviews",
    },

    {
      title: "Average Score",
      value: `${dashboardData.stats.averageScore}/100`,
      icon: FaRobot,
      description: "Overall performance",
    },

    {
      title: "Credits",
      value: userData?.credits || 0,
      icon: BsCoin,
      description: "Available credits",
    },
  ];

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  const quickActions = [
    {
      title: "Technical Interview",
      description: "Test your technical knowledge",
      icon: FaRobot,
      action: () => navigate("/interview/config"),
    },

    {
      title: "HR Interview",
      description: "Practice HR and behavioral questions",
      icon: FaMicrophone,
      action: () => navigate("/interview/config"),
    },

    {
      title: "Resume Analysis",
      description: "Analyze your resume with AI",
      icon: FaFileAlt,
      action: () => navigate("/resume"),
    },

    {
      title: "Interview History",
      description: "View your previous interviews",
      icon: FaHistory,
      action: () => navigate("/history"),
    },
  ];

  // =====================================================
  // PERFORMANCE
  // =====================================================

  const performanceItems = [
    [
      "Technical Skills",
      dashboardData.performance.technicalSkills,
    ],

    [
      "Communication",
      dashboardData.performance.communication,
    ],

    [
      "Confidence",
      dashboardData.performance.confidence,
    ],

    [
      "Correctness",
      dashboardData.performance.correctness,
    ],
  ];

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT DURATION
  // =====================================================

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds || 0);

    if (totalSeconds <= 0) {
      return "0 min";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    if (remainingSeconds === 0) {
      return `${minutes} min`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  // =====================================================
  // VIEW INTERVIEW REPORT
  // =====================================================

  const handleViewReport = (interview) => {
    if (!interview?._id) {
      return;
    }

    navigate(`/interview/result/${interview._id}`);
  };

  // =====================================================
  // SCORE LABEL
  // =====================================================

  const getScoreLabel = (score) => {
    const value = Number(score || 0);

    if (value >= 90) return "Excellent";
    if (value >= 80) return "Very Good";
    if (value >= 70) return "Good";
    if (value >= 60) return "Average";

    return "Needs Improvement";
  };

  // =====================================================
  // SCORE STYLE
  // =====================================================

  const getScoreStyle = (score) => {
    const value = Number(score || 0);

    if (value >= 80) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (value >= 60) {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-8">
      <div className="max-w-6xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 md:p-9 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <div className="flex items-center gap-2 text-green-600 mb-3">
                <IoSparkles />

                <span className="text-sm font-medium">
                  AI Interview Dashboard
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome back,{" "}
                {userData?.name || "Candidate"} 👋
              </h1>

              <p className="text-gray-500 mt-2 max-w-xl">
                Practice interviews, improve your skills and
                track your interview performance with AI.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/interview/config")
              }
              className="bg-black text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition"
            >
              Start New Interview

              <FaArrowRight size={13} />
            </button>

          </div>
        </motion.div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-2">
                      {loading ? "..." : stat.value}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-xl">
                    <Icon size={18} />
                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div className="mb-6">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Choose what you want to practice today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {quickActions.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.title}
                  onClick={item.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  whileHover={{ y: -3 }}
                  className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 text-left hover:border-gray-400 transition"
                >
                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="bg-black text-white p-3 rounded-xl">
                        <Icon size={18} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>

                    </div>

                    <FaArrowRight
                      size={13}
                      className="text-gray-400"
                    />

                  </div>
                </motion.button>
              );
            })}

          </div>
        </div>

        {/* =====================================================
            PERFORMANCE + RESUME
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* PERFORMANCE */}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-black text-white p-3 rounded-xl">
                <FaChartLine size={18} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Performance Overview
                </h2>

                <p className="text-xs text-gray-500">
                  Your interview performance
                </p>
              </div>

            </div>

            <div className="space-y-5">

              {performanceItems.map(
                ([label, value]) => (
                  <div key={label}>

                    <div className="flex justify-between text-sm mb-2">

                      <span className="text-gray-600">
                        {label}
                      </span>

                      <span className="font-medium text-gray-900">
                        {Math.round(value)}/100
                      </span>

                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            Math.max(0, value)
                          )}%`,
                        }}
                        transition={{
                          duration: 0.6,
                        }}
                        className="h-full bg-green-500 rounded-full"
                      />

                    </div>

                  </div>
                )
              )}

            </div>

            {dashboardData.stats.completedInterviews === 0 && (
              <div className="mt-6 bg-gray-50 rounded-xl p-4 text-center">

                <p className="text-sm text-gray-500">
                  Complete an interview to see your
                  performance.
                </p>

              </div>
            )}

          </div>

          {/* RESUME */}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-black text-white p-3 rounded-xl">
                <FaFileAlt size={18} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Resume
                </h2>

                <p className="text-xs text-gray-500">
                  AI-powered resume analysis
                </p>
              </div>

            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">

              <FaFileAlt
                size={35}
                className="mx-auto text-gray-300 mb-4"
              />

              <h3 className="font-semibold text-gray-900">
                Analyze your resume
              </h3>

              <p className="text-sm text-gray-500 mt-2 mb-5">
                Upload your resume and let AI generate
                personalized interview questions.
              </p>

              <button
                onClick={() => navigate("/resume")}
                className="bg-black text-white px-5 py-3 rounded-xl text-sm hover:bg-gray-800 transition"
              >
                Upload Resume
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            INTERVIEW HISTORY
        ===================================================== */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-6">

            <div>

              <div className="flex items-center gap-3">

                <div className="bg-black text-white p-3 rounded-xl">
                  <FaHistory size={17} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Interview History
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Your completed interview reports
                  </p>
                </div>

              </div>

            </div>

            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
            >
              View All
              <FaArrowRight size={11} />
            </button>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="py-12 text-center">

              <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

              <p className="text-sm text-gray-400">
                Loading interview history...
              </p>

            </div>

          ) : dashboardData.recentInterviews.length === 0 ? (

            /* EMPTY STATE */

            <div className="py-12 text-center">

              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4">

                <FaHistory
                  size={26}
                  className="text-gray-300"
                />

              </div>

              <h3 className="font-semibold text-gray-800">
                No interviews yet
              </h3>

              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Complete your first AI interview and
                your performance report will appear here.
              </p>

              <button
                onClick={() =>
                  navigate("/interview/config")
                }
                className="mt-5 bg-black text-white px-5 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition"
              >
                Start Interview
              </button>

            </div>

          ) : (

            /* INTERVIEW LIST */

            <div className="space-y-4">

              {dashboardData.recentInterviews.map(
                (interview, index) => {

                  const score = Math.round(
                    Number(interview.overallScore || 0)
                  );

                  const isCompleted =
                    interview.status === "completed";

                  return (
                    <motion.div
                      key={interview._id || index}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                      className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition"
                    >

                      {/* TOP */}

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        {/* LEFT */}

                        <div className="flex items-start gap-4">

                          <div className="w-11 h-11 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center">

                            {interview.type === "HR" ? (
                              <FaMicrophone
                                size={17}
                                className="text-gray-700"
                              />
                            ) : (
                              <FaRobot
                                size={17}
                                className="text-gray-700"
                              />
                            )}

                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-semibold text-gray-900">
                                {interview.role ||
                                  "Interview"}
                              </h3>

                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                                  <FaCheckCircle size={9} />
                                  Completed
                                </span>
                              )}

                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">

                              <span className="capitalize">
                                {interview.type ||
                                  "Technical"}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span className="capitalize">
                                {interview.difficulty ||
                                  "Easy"}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span className="flex items-center gap-1">
                                <FaCalendarAlt size={9} />
                                {formatDate(
                                  interview.completedAt ||
                                    interview.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                        {/* RIGHT SCORE */}

                        <div className="flex items-center gap-5">

                          <div
                            className={`border rounded-xl px-4 py-2 min-w-[100px] text-center ${getScoreStyle(
                              score
                            )}`}
                          >

                            <p className="text-[10px] uppercase tracking-wide opacity-70">
                              Score
                            </p>

                            <p className="text-lg font-bold">
                              {isCompleted
                                ? `${score}/100`
                                : "—"}
                            </p>

                          </div>

                          <div className="hidden sm:block text-right min-w-[80px]">

                            <p className="text-[10px] uppercase tracking-wide text-gray-400">
                              Result
                            </p>

                            <p className="text-xs font-medium text-gray-700 mt-1">
                              {isCompleted
                                ? getScoreLabel(score)
                                : "Incomplete"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="border-t border-gray-100 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div className="flex flex-wrap items-center gap-5 text-xs text-gray-500">

                          <span className="flex items-center gap-2">

                            <FaClock
                              size={11}
                              className="text-gray-400"
                            />

                            <span>
                              <span className="text-gray-400">
                                Duration
                              </span>{" "}
                              {formatDuration(
                                interview.duration
                              )}
                            </span>

                          </span>

                          {interview.totalQuestions && (
                            <span>
                              <span className="text-gray-400">
                                Questions
                              </span>{" "}
                              {interview.totalQuestions}
                            </span>
                          )}

                        </div>

                        {/* REPORT BUTTON */}

                        {isCompleted && interview._id ? (
                          <button
                            onClick={() =>
                              handleViewReport(
                                interview
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-gray-800 transition"
                          >
                            <FaEye size={12} />
                            View Report
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Report unavailable
                          </span>
                        )}

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Dashboard;