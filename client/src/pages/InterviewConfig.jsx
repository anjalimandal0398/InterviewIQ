import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaRobot,
  FaArrowRight,
  FaFilePdf,
  FaUpload,
  FaCheckCircle,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ServerUrl } from "../App";

const InterviewConfig = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("MERN Stack Developer");
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Medium");
  const [type, setType] = useState("Technical");

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  const [uploadingResume, setUploadingResume] = useState(false);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE RESUME SELECT
  // ==========================================

  const handleResumeSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setResumeFile(file);
    setResumeText("");
    setResumeAnalysis(null);
  };

  // ==========================================
  // UPLOAD + EXTRACT RESUME
  // ==========================================

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      alert("Please select a resume first.");
      return;
    }

    try {
      setUploadingResume(true);

      const formData = new FormData();

      formData.append("resume", resumeFile);

      const result = await axios.post(
        ServerUrl + "/api/resume/upload",
        formData
      );

      if (!result.data.success) {
        alert("Resume upload failed.");
        return;
      }

      const extractedText = result.data.resumeText;

      setResumeText(extractedText);

      alert("Resume uploaded successfully.");

    } catch (error) {
      console.log(
        "Resume Upload Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to upload resume."
      );
    } finally {
      setUploadingResume(false);
    }
  };

  // ==========================================
  // ANALYZE RESUME
  // ==========================================

  const handleAnalyzeResume = async () => {
    if (!resumeText) {
      alert("Please upload your resume first.");
      return;
    }

    try {
      setAnalyzingResume(true);

      const result = await axios.post(
        ServerUrl + "/api/resume/analyze",
        {
          resumeText,
        }
      );

      if (!result.data.success) {
        alert("Resume analysis failed.");
        return;
      }

      const analysis = result.data.analysis;

      setResumeAnalysis(analysis);

      // Automatically use suggested role
      if (
        analysis?.suggestedRoles &&
        analysis.suggestedRoles.length > 0
      ) {
        setRole(analysis.suggestedRoles[0]);
      }

    } catch (error) {
      console.log(
        "Resume Analysis Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to analyze resume."
      );
    } finally {
      setAnalyzingResume(false);
    }
  };

  // ==========================================
  // START INTERVIEW
  // ==========================================

  const handleStartInterview = async () => {
    try {
      setLoading(true);

      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        {
          role,
          experience,
          difficulty,
          type,

          // Send resume information if available
          resumeText: resumeText || "",

          resumeAnalysis: resumeAnalysis || null,
        }
      );

      navigate("/interview/setup", {
        state: {
          role,
          experience,
          difficulty,
          type,

          questions: result.data.questions,

          resumeText,
          resumeAnalysis,
        },
      });

    } catch (error) {
      console.log(
        "Start Interview Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to start interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-10">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto"
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 md:p-10 mb-6">

          <div className="text-center">

            <div className="flex justify-center mb-4">

              <div className="bg-black text-white p-4 rounded-2xl">
                <FaRobot size={25} />
              </div>

            </div>

            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">

              <IoSparkles />

              <span className="text-sm font-medium">
                AI Powered Interview
              </span>

            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Set Up Your Interview
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Configure your interview or let AI personalize it
              using your resume.
            </p>

          </div>

        </div>

        {/* ==========================================
            RESUME SECTION
        ========================================== */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="bg-red-50 text-red-500 p-3 rounded-xl">
              <FaFilePdf size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Personalize With Your Resume
              </h2>

              <p className="text-sm text-gray-500">
                AI will analyze your resume and ask questions
                based on your skills and projects.
              </p>
            </div>

          </div>

          {/* Upload Box */}

          <label className="block cursor-pointer">

            <div className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-7 text-center transition">

              <FaUpload
                className="mx-auto text-gray-400 mb-3"
                size={22}
              />

              <p className="font-medium text-gray-700">
                {resumeFile
                  ? resumeFile.name
                  : "Click to upload your resume"}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                PDF only
              </p>

            </div>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleResumeSelect}
              className="hidden"
            />

          </label>

          {/* Upload Button */}

          {resumeFile && !resumeText && (

            <button
              onClick={handleResumeUpload}
              disabled={uploadingResume}
              className="w-full mt-4 bg-black text-white py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {uploadingResume
                ? "Uploading Resume..."
                : "Upload Resume"}
            </button>

          )}

          {/* Analyze Button */}

          {resumeText && !resumeAnalysis && (

            <button
              onClick={handleAnalyzeResume}
              disabled={analyzingResume}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {analyzingResume
                ? "AI Analyzing Resume..."
                : "Analyze Resume with AI"}
            </button>

          )}

          {/* Resume Analysis Success */}

          {resumeAnalysis && (

            <div className="mt-5 bg-green-50 border border-green-100 rounded-2xl p-5">

              <div className="flex items-center gap-2 mb-4">

                <FaCheckCircle className="text-green-600" />

                <p className="font-semibold text-green-700">
                  Resume Analyzed Successfully
                </p>

              </div>

              <p className="text-sm text-gray-600 mb-3">
                Experience Level:{" "}
                <span className="font-medium">
                  {resumeAnalysis.experienceLevel}
                </span>
              </p>

              {resumeAnalysis.suggestedRoles?.length > 0 && (

                <div>

                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Suggested Roles
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {resumeAnalysis.suggestedRoles.map(
                      (item, index) => (

                        <span
                          key={index}
                          className="bg-white border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-full"
                        >
                          {item}
                        </span>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>

          )}

        </div>

        {/* ==========================================
            INTERVIEW SETTINGS
        ========================================== */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 md:p-10">

          {/* Job Role */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >
              <option>MERN Stack Developer</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Full Stack Developer</option>
              <option>JavaScript Developer</option>
              <option>Junior Software Engineer</option>
              <option>Associate Frontend Developer</option>
              <option>Associate Backend Developer</option>
            </select>

          </div>

          {/* Experience */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>

            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >
              <option>Fresher</option>
              <option>0-1 Years</option>
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
            </select>

          </div>

          {/* Difficulty */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

          </div>

          {/* Interview Type */}

          <div className="mb-8">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >
              <option>Technical</option>
              <option>HR</option>
              <option>Mixed</option>
            </select>

          </div>

          {/* Start Button */}

          <motion.button
            onClick={handleStartInterview}
            disabled={loading}
            whileHover={{
              scale: loading ? 1 : 1.02,
            }}
            whileTap={{
              scale: loading ? 1 : 0.97,
            }}
            className="w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-3 font-medium disabled:opacity-60"
          >

            {loading
              ? "Generating Interview..."
              : "Start AI Interview"}

            {!loading && (
              <FaArrowRight size={14} />
            )}

          </motion.button>

        </div>

      </motion.div>

    </div>
  );
};

export default InterviewConfig;