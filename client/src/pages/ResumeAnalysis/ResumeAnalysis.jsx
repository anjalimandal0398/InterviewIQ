import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import {
  FaFilePdf,
  FaUpload,
  FaCheckCircle,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaDatabase,
  FaTools,
  FaLightbulb,
  FaSpinner,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { ServerUrl } from "../../App";

const ResumeAnalysis = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resume, setResume] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // GET SAVED RESUME
  // =====================================================

  const fetchMyResume = async () => {
    try {
      setLoadingResume(true);
      setError("");

      const result = await axios.get(
        `${ServerUrl}/api/resume/my-resume`,
        {
          withCredentials: true,
        }
      );

      if (result.data.success) {
        setResume(result.data.resume);
      }
    } catch (error) {
      // 404 means user has not uploaded a resume yet
      if (error.response?.status !== 404) {
        console.error("Get Resume Error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your resume."
        );
      }
    } finally {
      setLoadingResume(false);
    }
  };

  // =====================================================
  // LOAD RESUME ON PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchMyResume();
  }, []);

  // =====================================================
  // SELECT PDF
  // =====================================================

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setResumeFile(file);
    setError("");
  };

  // =====================================================
  // UPLOAD + ANALYZE
  // =====================================================

  const handleUploadResume = async () => {
    if (!resumeFile) {
      alert("Please select a resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("resume", resumeFile);

      const result = await axios.post(
        `${ServerUrl}/api/resume/upload`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (!result.data.success) {
        throw new Error(
          result.data.message || "Resume upload failed."
        );
      }

      // Backend already saved everything in MongoDB
      // and returned the complete resume.
      setResume({
        ...result.data.resume,
        resumeText: result.data.resumeText,
        analysis: result.data.analysis,
      });

      setResumeFile(null);

      alert("Resume uploaded and analyzed successfully!");
    } catch (error) {
      console.error(
        "Resume Upload Error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to upload and analyze resume."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingResume) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-3xl text-gray-700 mb-4" />

          <p className="text-gray-600">
            Loading your resume analysis...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ANALYSIS DATA
  // =====================================================

  const analysis = resume?.analysis;

  const candidate = analysis?.candidate || {};

  const skills = analysis?.skills || {};

  const projects = analysis?.projects || [];

  const education = analysis?.education || [];

  const certifications = analysis?.certifications || [];

  const suggestedRoles = analysis?.suggestedRoles || [];

  const interviewFocusAreas =
    analysis?.interviewFocusAreas || [];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-10">
      <div className="max-w-6xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 md:p-10 mb-6"
        >
          <div className="text-center">

            <div className="flex justify-center mb-4">
              <div className="bg-black text-white p-4 rounded-2xl">
                <FaFilePdf size={26} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <IoSparkles />

              <span className="text-sm font-medium">
                AI Powered Resume Analysis
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Resume Analysis
            </h1>

            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
              Upload your resume once and our AI will analyze your
              skills, projects, education, experience and suitable
              job roles.
            </p>
          </div>
        </motion.div>

        {/* =====================================================
            UPLOAD SECTION
        ===================================================== */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="bg-red-50 text-red-500 p-3 rounded-xl">
              <FaFilePdf size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                {resume
                  ? "Update Your Resume"
                  : "Upload Your Resume"}
              </h2>

              <p className="text-sm text-gray-500">
                PDF only. AI will automatically analyze your resume.
              </p>
            </div>

          </div>

          <label className="block cursor-pointer">

            <div className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-8 text-center transition">

              <FaUpload
                className="mx-auto text-gray-400 mb-3"
                size={24}
              />

              <p className="font-medium text-gray-700">
                {resumeFile
                  ? resumeFile.name
                  : "Click to select your PDF resume"}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                PDF only
              </p>

            </div>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

          </label>

          {resumeFile && (
            <button
              onClick={handleUploadResume}
              disabled={uploading}
              className="w-full mt-4 bg-black text-white py-3 rounded-xl font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  AI Analyzing Resume...
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload & Analyze Resume
                </>
              )}
            </button>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

        </div>

        {/* =====================================================
            NO RESUME
        ===================================================== */}

        {!resume && !uploading && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">

            <FaFilePdf
              className="mx-auto text-gray-300 mb-4"
              size={50}
            />

            <h2 className="text-xl font-bold text-gray-800">
              No Resume Uploaded Yet
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Upload your resume above to generate your complete
              AI-powered analysis.
            </p>

          </div>
        )}

        {/* =====================================================
            ANALYSIS
        ===================================================== */}

        {analysis && (
          <div className="space-y-6">

            {/* =================================================
                SUCCESS
            ================================================= */}

            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center gap-3">

              <FaCheckCircle
                className="text-green-600"
                size={22}
              />

              <div>
                <p className="font-semibold text-green-700">
                  Resume Analyzed Successfully
                </p>

                <p className="text-sm text-green-600">
                  Your resume is saved and will automatically be
                  used during AI interviews.
                </p>
              </div>

            </div>

            {/* =================================================
                CANDIDATE
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <FaUser />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Candidate Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Information extracted from your resume
                  </p>
                </div>

              </div>

              <div className="grid md:grid-cols-2 gap-4">

                <InfoItem
                  label="Name"
                  value={candidate.name}
                />

                <InfoItem
                  label="Email"
                  value={candidate.email}
                />

                <InfoItem
                  label="Phone"
                  value={candidate.phone}
                />

                <InfoItem
                  label="Location"
                  value={candidate.location}
                />

              </div>

            </section>

            {/* =================================================
                SUMMARY + EXPERIENCE
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-5">

                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
                  <FaBriefcase />
                </div>

                <h2 className="text-xl font-bold">
                  Professional Overview
                </h2>

              </div>

              <div className="mb-5">

                <p className="text-sm font-semibold text-gray-500 mb-2">
                  Experience Level
                </p>

                <span className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm">
                  {analysis.experienceLevel || "Not specified"}
                </span>

              </div>

              <div>

                <p className="text-sm font-semibold text-gray-500 mb-2">
                  Professional Summary
                </p>

                <p className="text-gray-700 leading-7">
                  {analysis.professionalSummary ||
                    "No professional summary found."}
                </p>

              </div>

            </section>

            {/* =================================================
                SKILLS
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-yellow-50 text-yellow-600 p-3 rounded-xl">
                  <FaCode />
                </div>

                <h2 className="text-xl font-bold">
                  Skills
                </h2>

              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <SkillGroup
                  title="Programming Languages"
                  icon={<FaCode />}
                  items={skills.programmingLanguages}
                />

                <SkillGroup
                  title="Frontend"
                  icon={<FaCode />}
                  items={skills.frontend}
                />

                <SkillGroup
                  title="Backend"
                  icon={<FaCode />}
                  items={skills.backend}
                />

                <SkillGroup
                  title="Databases"
                  icon={<FaDatabase />}
                  items={skills.databases}
                />

                <SkillGroup
                  title="Tools"
                  icon={<FaTools />}
                  items={skills.tools}
                />

                <SkillGroup
                  title="Core Concepts"
                  icon={<FaLightbulb />}
                  items={skills.coreConcepts}
                />

              </div>

            </section>

            {/* =================================================
                PROJECTS
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                  <FaCode />
                </div>

                <h2 className="text-xl font-bold">
                  Projects
                </h2>

              </div>

              {projects.length > 0 ? (
                <div className="space-y-4">

                  {projects.map((project, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl p-5"
                    >

                      <h3 className="font-bold text-lg text-gray-900">
                        {project.name || "Project"}
                      </h3>

                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">

                          {project.technologies.map(
                            (technology, techIndex) => (
                              <span
                                key={techIndex}
                                className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                              >
                                {technology}
                              </span>
                            )
                          )}

                        </div>
                      )}

                      <p className="text-gray-600 text-sm leading-6 mt-4">
                        {project.description ||
                          "No project description available."}
                      </p>

                    </div>
                  ))}

                </div>
              ) : (
                <EmptyText text="No projects found in resume." />
              )}

            </section>

            {/* =================================================
                EDUCATION
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-6">

                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                  <FaGraduationCap />
                </div>

                <h2 className="text-xl font-bold">
                  Education
                </h2>

              </div>

              {education.length > 0 ? (
                <div className="space-y-4">

                  {education.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl p-5"
                    >

                      <h3 className="font-bold text-gray-900">
                        {item.degree || "Degree"}
                      </h3>

                      <p className="text-gray-600 text-sm mt-2">
                        {item.institution || "Institution not specified"}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">

                        {item.year && (
                          <span>
                            Year: {item.year}
                          </span>
                        )}

                        {item.score && (
                          <span>
                            Score: {item.score}
                          </span>
                        )}

                      </div>

                    </div>
                  ))}

                </div>
              ) : (
                <EmptyText text="No education information found." />
              )}

            </section>

            {/* =================================================
                CERTIFICATIONS
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <h2 className="text-xl font-bold mb-5">
                Certifications
              </h2>

              {certifications.length > 0 ? (
                <div className="flex flex-wrap gap-3">

                  {certifications.map((item, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm"
                    >
                      {item}
                    </span>
                  ))}

                </div>
              ) : (
                <EmptyText text="No certifications found." />
              )}

            </section>

            {/* =================================================
                SUGGESTED ROLES
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-5">

                <IoSparkles className="text-green-600 text-2xl" />

                <h2 className="text-xl font-bold">
                  AI Suggested Job Roles
                </h2>

              </div>

              {suggestedRoles.length > 0 ? (
                <div className="flex flex-wrap gap-3">

                  {suggestedRoles.map((role, index) => (
                    <span
                      key={index}
                      className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      {role}
                    </span>
                  ))}

                </div>
              ) : (
                <EmptyText text="No suggested roles available." />
              )}

            </section>

            {/* =================================================
                INTERVIEW FOCUS
            ================================================= */}

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

              <div className="flex items-center gap-3 mb-5">

                <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
                  <FaLightbulb />
                </div>

                <h2 className="text-xl font-bold">
                  AI Interview Focus Areas
                </h2>

              </div>

              {interviewFocusAreas.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">

                  {interviewFocusAreas.map(
                    (area, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 text-sm text-gray-700"
                      >
                        <span className="font-semibold mr-2">
                          {index + 1}.
                        </span>

                        {area}
                      </div>
                    )
                  )}

                </div>
              ) : (
                <EmptyText text="No interview focus areas available." />
              )}

            </section>

          </div>
        )}

      </div>
    </div>
  );
};

// =====================================================
// INFO ITEM
// =====================================================

const InfoItem = ({ label, value }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="font-medium text-gray-800 break-words">
        {value || "Not available"}
      </p>
    </div>
  );
};

// =====================================================
// SKILL GROUP
// =====================================================

const SkillGroup = ({ title, icon, items = [] }) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-5">

      <div className="flex items-center gap-2 mb-4">

        <span className="text-gray-600">
          {icon}
        </span>

        <h3 className="font-semibold text-gray-800">
          {title}
        </h3>

      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">

          {items.map((item, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
            >
              {item}
            </span>
          ))}

        </div>
      ) : (
        <p className="text-sm text-gray-400">
          No data found
        </p>
      )}

    </div>
  );
};

// =====================================================
// EMPTY TEXT
// =====================================================

const EmptyText = ({ text }) => {
  return (
    <p className="text-sm text-gray-400">
      {text}
    </p>
  );
};

export default ResumeAnalysis;