import React from "react";
import { motion } from "motion/react";
import {
  FaRobot,
  FaArrowRight,
  FaHistory,
  FaFileAlt,
  FaChartLine,
  FaMicrophone,
} from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);

  const stats = [
    {
      title: "Total Interviews",
      value: "0",
      icon: FaHistory,
      description: "Interviews taken",
    },
    {
      title: "Completed",
      value: "0",
      icon: FaChartLine,
      description: "Completed interviews",
    },
    {
      title: "Average Score",
      value: "0/10",
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

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-8">
      <div className="max-w-6xl mx-auto">

        {/* ================= HEADER ================= */}

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
                Welcome back, {userData?.name || "Candidate"} 👋
              </h1>

              <p className="text-gray-500 mt-2 max-w-xl">
                Practice interviews, improve your skills and track your
                interview performance with AI.
              </p>
            </div>

            <button
              onClick={() => navigate("/interview/config")}
              className="bg-black text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition"
            >
              Start New Interview
              <FaArrowRight size={13} />
            </button>

          </div>
        </motion.div>

        {/* ================= STATS ================= */}

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
                      {stat.value}
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

        {/* ================= QUICK ACTIONS ================= */}

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

        {/* ================= PERFORMANCE ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Performance */}

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

              {[
                ["Technical Skills", 0],
                ["Communication", 0],
                ["Confidence", 0],
                ["Correctness", 0],
              ].map(([label, value]) => (
                <div key={label}>

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      {label}
                    </span>

                    <span className="font-medium text-gray-900">
                      {value}/10
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${value * 10}%`,
                      }}
                    />

                  </div>

                </div>
              ))}

            </div>

            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">
                Complete an interview to see your performance.
              </p>
            </div>

          </div>

          {/* Resume */}

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
                Upload your resume and let AI generate personalized
                interview questions.
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

        {/* ================= RECENT INTERVIEWS ================= */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="font-bold text-gray-900">
                Recent Interviews
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Your latest interview activity
              </p>
            </div>

            <button
              onClick={() => navigate("/history")}
              className="text-sm text-gray-600 hover:text-black"
            >
              View All
            </button>

          </div>

          <div className="text-center py-10">

            <FaHistory
              size={32}
              className="mx-auto text-gray-300 mb-4"
            />

            <h3 className="font-medium text-gray-700">
              No interviews yet
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Start your first AI interview to see your results here.
            </p>

            <button
              onClick={() => navigate("/interview/config")}
              className="mt-5 bg-black text-white px-5 py-2.5 rounded-xl text-sm"
            >
              Start Interview
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;