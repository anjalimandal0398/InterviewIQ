
import React from "react";
import { motion } from "motion/react";
import {
  FaRobot,
  FaMicrophone,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <IoSparkles size={16} />
                AI-Powered Interview Practice
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Prepare Smarter.
                <br />
                <span className="text-green-600">
                  Interview Better.
                </span>
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl mb-8">
                Practice realistic interviews with AI, improve your answers,
                identify your weak areas, and build confidence before your
                real interview.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/interview/config")}
                  className="flex items-center justify-center gap-3 px-7 py-3.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
                >
                  Start Interview
                  <FaArrowRight size={14} />
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-7 py-3.5 bg-white text-gray-800 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition"
                >
                  View Dashboard
                </button>
              </div>
            </motion.div>

            {/* Right AI Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="bg-black rounded-3xl p-8 md:p-10 shadow-2xl">
                {/* AI Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-white text-black p-3 rounded-xl">
                    <FaRobot size={24} />
                  </div>

                  <div>
                    <h3 className="text-white font-semibold">
                      InterviewIQ AI
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Your personal interview coach
                    </p>
                  </div>
                </div>

                {/* Question */}
                <div className="bg-white/10 rounded-2xl p-5 mb-4">
                  <p className="text-gray-400 text-xs mb-2">
                    AI INTERVIEW QUESTION
                  </p>

                  <p className="text-white text-lg font-medium">
                    "Tell me about yourself and your experience."
                  </p>
                </div>

                {/* Evaluation */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 text-sm">
                      AI Evaluation
                    </span>

                    <span className="text-green-400 font-semibold">
                      86/100
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-[86%] bg-green-500 rounded-full" />
                  </div>

                  <p className="text-gray-400 text-xs mt-3">
                    Good answer! Improve your introduction and add measurable
                    achievements.
                  </p>
                </div>
              </div>

              {/* Floating Performance Card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 -left-5 md:-left-10 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <FaChartLine />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Performance
                  </p>

                  <p className="font-bold text-gray-900">
                    Improving ↑
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="text-center mb-12">
            <p className="text-green-600 font-medium mb-2">
              Why InterviewIQ?
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything you need to prepare
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-xl mb-5">
                <FaRobot />
              </div>

              <h3 className="text-xl font-semibold mb-3">
                AI Mock Interviews
              </h3>

              <p className="text-gray-500 leading-relaxed">
                Practice realistic interview questions generated according
                to your role, experience, and difficulty level.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-xl mb-5">
                <FaMicrophone />
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Answer & Practice
              </h3>

              <p className="text-gray-500 leading-relaxed">
                Answer interview questions and practice explaining your
                technical knowledge clearly and confidently.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl mb-5">
                <FaChartLine />
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Detailed Feedback
              </h3>

              <p className="text-gray-500 leading-relaxed">
                Get AI-powered scores, strengths, weaknesses, and suggestions
                to improve your interview performance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="bg-green-500 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for your next interview?
            </h2>

            <p className="text-green-50 max-w-2xl mx-auto mb-7">
              Start practicing today and turn your interview weaknesses into
              strengths.
            </p>

            <button
              onClick={() => navigate("/interview/config")}
              className="inline-flex items-center gap-3 bg-black text-white px-7 py-3.5 rounded-full font-medium hover:bg-gray-800 transition"
            >
              Start Your Interview
              <FaArrowRight size={14} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaRobot />
            <span className="font-semibold">
              InterviewIQ
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Practice smarter. Interview better.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
