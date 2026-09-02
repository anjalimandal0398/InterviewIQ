import React, { useEffect, useState } from "react";

import { motion } from "motion/react";

import {
  FaRobot,
  FaArrowRight,
  FaFilePdf,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaCode,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";

import { IoSparkles } from "react-icons/io5";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import { ServerUrl } from "../App";

const InterviewConfig = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("MERN Stack Developer");

  const [experience, setExperience] =
    useState("Fresher");

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [type, setType] =
    useState("Technical");

  const [resume, setResume] =
    useState(null);

  const [loadingResume, setLoadingResume] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // GET SAVED RESUME
  // =====================================================

  const fetchMyResume = async () => {
    try {
      setLoadingResume(true);

      const result = await axios.get(
        `${ServerUrl}/api/resume/my-resume`,
        {
          withCredentials: true,
        }
      );

      if (result.data.success) {
        const savedResume = result.data.resume;

        setResume(savedResume);

        // Automatically use AI suggested role
        const suggestedRoles =
          savedResume?.analysis?.suggestedRoles;

        if (
          suggestedRoles &&
          suggestedRoles.length > 0
        ) {
          setRole(suggestedRoles[0]);
        }

        // Automatically use experience
        const experienceLevel =
          savedResume?.analysis?.experienceLevel;

        if (experienceLevel) {
          const normalized =
            experienceLevel.toLowerCase();

          if (normalized.includes("fresher")) {
            setExperience("Fresher");
          } else if (
            normalized.includes("0-1")
          ) {
            setExperience("0-1 Years");
          } else if (
            normalized.includes("1-3")
          ) {
            setExperience("1-3 Years");
          } else if (
            normalized.includes("3-5")
          ) {
            setExperience("3-5 Years");
          } else if (
            normalized.includes("5+")
          ) {
            setExperience("5+ Years");
          }
        }
      }
    } catch (error) {
      // No resume uploaded yet
      if (error.response?.status === 404) {
        setResume(null);
      } else {
        console.error(
          "Interview Resume Error:",
          error.response?.data || error
        );
      }
    } finally {
      setLoadingResume(false);
    }
  };

  // =====================================================
  // LOAD SAVED RESUME WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchMyResume();
  }, []);

  // =====================================================
  // START INTERVIEW
  // =====================================================

  const handleStartInterview = async () => {
    try {
      setLoading(true);

      const resumeText =
        resume?.resumeText || "";

      const resumeAnalysis =
        resume?.analysis || null;

      const result = await axios.post(
        `${ServerUrl}/api/interview/generate-questions`,
        {
          role,
          experience,
          difficulty,
          type,

          // Saved resume data
          resumeText,

          resumeAnalysis,
        },
        {
          withCredentials: true,
        }
      );

      if (!result.data.success) {
        alert(
          result.data.message ||
            "Unable to generate interview."
        );

        return;
      }

      navigate("/interview/setup", {
        state: {
          role,
          experience,
          difficulty,
          type,

          questions: result.data.questions,

          // Keep resume data for interview
          resumeText,

          resumeAnalysis,
        },
      });
    } catch (error) {
      console.error(
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

  // =====================================================
  // LOADING RESUME
  // =====================================================

  if (loadingResume) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">

        <div className="text-center">

          <FaSpinner
            className="animate-spin mx-auto text-3xl text-gray-700 mb-4"
          />

          <p className="text-gray-600">
            Loading your resume analysis...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // RESUME ANALYSIS
  // =====================================================

  const analysis =
    resume?.analysis || null;

  const candidate =
    analysis?.candidate || {};

  const skills =
    analysis?.skills || {};

  const projects =
    analysis?.projects || [];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-10">

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full max-w-4xl mx-auto"
      >

        {/* =================================================
            HEADER
        ================================================= */}

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
              Configure your interview. Your saved resume
              analysis will automatically personalize the interview.
            </p>

          </div>

        </div>

        {/* =================================================
            SAVED RESUME
        ================================================= */}

        {resume ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 mb-6">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                  <FaFilePdf size={20} />
                </div>

                <div>

                  <h2 className="font-bold text-gray-900">
                    Your Resume
                  </h2>

                  <p className="text-sm text-gray-500">
                    Saved resume analysis will be used for this interview.
                  </p>

                </div>

              </div>

              <FaCheckCircle
                className="text-green-600"
                size={24}
              />

            </div>

            {/* =================================================
                FILE
            ================================================= */}

            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5">

              <div className="flex items-center gap-3">

                <FaFilePdf
                  className="text-red-500"
                  size={22}
                />

                <div>

                  <p className="font-medium text-gray-800">
                    {resume.originalName ||
                      resume.fileName ||
                      "Resume.pdf"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Resume successfully analyzed
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                CANDIDATE
            ================================================= */}

            {candidate.name && (
              <div className="grid md:grid-cols-2 gap-4 mb-5">

                <div className="bg-gray-50 rounded-xl p-4">

                  <div className="flex items-center gap-2 mb-2">

                    <FaUser className="text-gray-500" />

                    <p className="text-xs text-gray-500">
                      Candidate
                    </p>

                  </div>

                  <p className="font-semibold text-gray-800">
                    {candidate.name}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <div className="flex items-center gap-2 mb-2">

                    <FaBriefcase className="text-gray-500" />

                    <p className="text-xs text-gray-500">
                      Experience
                    </p>

                  </div>

                  <p className="font-semibold text-gray-800">
                    {analysis?.experienceLevel ||
                      "Not specified"}
                  </p>

                </div>

              </div>
            )}

            {/* =================================================
                SUGGESTED ROLES
            ================================================= */}

            {analysis?.suggestedRoles?.length > 0 && (
              <div className="mb-5">

                <p className="text-sm font-semibold text-gray-700 mb-3">
                  AI Suggested Roles
                </p>

                <div className="flex flex-wrap gap-2">

                  {analysis.suggestedRoles.map(
                    (item, index) => (
                      <span
                        key={index}
                        className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-full"
                      >
                        {item}
                      </span>
                    )
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                SKILLS
            ================================================= */}

            {skills && (
              <div>

                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Skills detected from resume
                </p>

                <div className="flex flex-wrap gap-2">

                  {[
                    ...(skills.programmingLanguages || []),
                    ...(skills.frontend || []),
                    ...(skills.backend || []),
                    ...(skills.databases || []),
                    ...(skills.tools || []),
                  ]
                    .slice(0, 20)
                    .map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}

                </div>

              </div>
            )}

            {/* =================================================
                PROJECTS
            ================================================= */}

            {projects.length > 0 && (
              <div className="mt-5">

                <div className="flex items-center gap-2 mb-3">

                  <FaCode className="text-gray-500" />

                  <p className="text-sm font-semibold text-gray-700">
                    Projects detected
                  </p>

                </div>

                <div className="flex flex-wrap gap-2">

                  {projects.map(
                    (project, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                      >
                        {project.name ||
                          "Project"}
                      </span>
                    )
                  )}

                </div>

              </div>
            )}

            <div className="mt-5 text-sm text-green-700 bg-green-50 rounded-xl p-4">

              <FaCheckCircle className="inline mr-2" />

              This resume will automatically be used by AI to
              generate personalized interview questions.

            </div>

          </div>
        ) : (
          /* =================================================
             NO RESUME
          ================================================= */

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6 text-center">

            <FaFilePdf
              className="mx-auto text-gray-300 mb-4"
              size={45}
            />

            <h2 className="font-bold text-gray-900 text-xl">
              No Resume Found
            </h2>

            <p className="text-sm text-gray-500 mt-2 mb-5">
              Please upload and analyze your resume from the
              Resume Analysis page before starting a personalized
              interview.
            </p>

            <button
              onClick={() =>
                navigate("/resume")
              }
              className="bg-black text-white px-6 py-3 rounded-xl font-medium"
            >
              Go To Resume Analysis
            </button>

          </div>
        )}

        {/* =================================================
            INTERVIEW SETTINGS
        ================================================= */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 md:p-10">

          {/* JOB ROLE */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Role
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >

              <option>
                MERN Stack Developer
              </option>

              <option>
                Frontend Developer
              </option>

              <option>
                Backend Developer
              </option>

              <option>
                Full Stack Developer
              </option>

              <option>
                JavaScript Developer
              </option>

              <option>
                Junior Software Engineer
              </option>

              <option>
                Associate Frontend Developer
              </option>

              <option>
                Associate Backend Developer
              </option>

            </select>

          </div>

          {/* EXPERIENCE */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>

            <select
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >

              <option>Fresher</option>
              <option>0-1 Years</option>
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>

            </select>

          </div>

          {/* DIFFICULTY */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >

              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>

            </select>

          </div>

          {/* TYPE */}

          <div className="mb-8">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"
            >

              <option>Technical</option>
              <option>HR</option>
              <option>Mixed</option>

            </select>

          </div>

          {/* START */}

          <motion.button
            onClick={handleStartInterview}
            disabled={loading || !resume}
            whileHover={{
              scale:
                loading || !resume
                  ? 1
                  : 1.02,
            }}
            whileTap={{
              scale:
                loading || !resume
                  ? 1
                  : 0.97,
            }}
            className="w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-3 font-medium disabled:opacity-50"
          >

            {loading
              ? "Generating Personalized Interview..."
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