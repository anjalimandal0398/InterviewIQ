import React, { useEffect, useRef, useState } from "react";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaExclamationTriangle,
  FaLightbulb,
  FaQuestionCircle,
  FaRobot,
  FaSpinner,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";

import { IoSparkles } from "react-icons/io5";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import axios from "axios";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";


// ======================================================
// API URL
// ======================================================

const ServerUrl =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";


// ======================================================
// HELPERS
// ======================================================

const getScore = (value) => {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};


const formatDuration = (seconds) => {
  const totalSeconds = Number(seconds);

  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0 min";
  }

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const remainingSeconds = Math.floor(
    totalSeconds % 60
  );

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};


const getScoreLabel = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";

  return "Keep Practicing";
};


const getScoreColor = (score) => {
  if (score >= 75) {
    return "text-green-600";
  }

  if (score >= 50) {
    return "text-yellow-600";
  }

  return "text-red-600";
};


const getScoreBg = (score) => {
  if (score >= 75) {
    return "bg-green-50 border-green-200";
  }

  if (score >= 50) {
    return "bg-yellow-50 border-yellow-200";
  }

  return "bg-red-50 border-red-200";
};


const getScoreBar = (score) => {
  if (score >= 75) {
    return "bg-green-500";
  }

  if (score >= 50) {
    return "bg-yellow-500";
  }

  return "bg-red-500";
};


const getArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};


// ======================================================
// SCORE CARD
// ======================================================

const ScoreCard = ({ title, score, icon }) => {
  const safeScore = getScore(score);

  return (
    <div
      className={`rounded-2xl border p-5 ${getScoreBg(
        safeScore
      )}`}
    >
      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            {icon}
          </div>

          <p className="font-semibold text-gray-800">
            {title}
          </p>

        </div>

        <span
          className={`text-2xl font-bold ${getScoreColor(
            safeScore
          )}`}
        >
          {safeScore}
        </span>

      </div>

      <div className="w-full h-2 bg-white rounded-full overflow-hidden">

        <div
          className={`h-full rounded-full ${getScoreBar(
            safeScore
          )}`}
          style={{
            width: `${safeScore}%`,
          }}
        />

      </div>
    </div>
  );
};


// ======================================================
// MAIN COMPONENT
// ======================================================

const InterviewResult = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const params = useParams();

  const resultRef = useRef(null);


  // ====================================================
  // STATE
  // ====================================================

  const [interview, setInterview] = useState(
    location.state?.interviewData ||
      location.state?.interview ||
      null
  );

  const [loading, setLoading] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");


  // ====================================================
  // INTERVIEW ID
  // ====================================================

  const interviewId =
    params.id ||
    location.state?.interviewId ||
    location.state?.interviewData?.interviewId ||
    location.state?.interviewData?._id ||
    location.state?.interview?._id ||
    null;


  // ====================================================
  // FETCH INTERVIEW
  // ====================================================

  useEffect(() => {

    const fetchInterview = async () => {

      if (!interviewId) {

        if (interview) {
          return;
        }

        setError(
          "Interview result data was not found."
        );

        return;
      }


      setLoading(true);

      setError("");


      try {

        const response = await axios.get(
          `${ServerUrl}/api/interview/${interviewId}`,
          {
            withCredentials: true,
          }
        );


        const result =
          response.data?.interview ||
          response.data?.data ||
          response.data;


        if (result) {

          setInterview(result);

        } else {

          setError(
            "Interview result could not be loaded."
          );

        }

      } catch (err) {

        console.error(
          "Interview Result Error:",
          err.response?.data || err
        );


        if (!interview) {

          setError(
            err.response?.data?.message ||
              "Unable to load interview result."
          );

        }

      } finally {

        setLoading(false);

      }

    };


    fetchInterview();

  }, [interviewId]);


  // ====================================================
  // DOWNLOAD PDF
  // ====================================================
  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
  
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
  
      let y = 20;
  
      const addPageIfNeeded = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - 15) {
          pdf.addPage();
          y = 20;
        }
      };
  
      const addText = (
        text,
        x,
        fontSize = 10,
        maxWidth = contentWidth,
        lineHeight = 5
      ) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", "normal");
  
        const safeText =
          text === null || text === undefined
            ? ""
            : String(text);
  
        const lines = pdf.splitTextToSize(
          safeText,
          maxWidth
        );
  
        addPageIfNeeded(lines.length * lineHeight + 2);
  
        pdf.text(lines, x, y);
  
        y += lines.length * lineHeight;
  
        return lines.length;
      };
  
      const addHeading = (text) => {
        addPageIfNeeded(12);
  
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(79, 70, 229);
  
        pdf.text(String(text), margin, y);
  
        y += 9;
  
        pdf.setTextColor(17, 24, 39);
      };
  
      const addSmallHeading = (text) => {
        addPageIfNeeded(10);
  
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
  
        pdf.text(String(text), margin, y);
  
        y += 7;
  
        pdf.setTextColor(17, 24, 39);
      };
  
      // ------------------------------------------------
      // HEADER
      // ------------------------------------------------
  
      pdf.setFillColor(79, 70, 229);
      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        32,
        4,
        4,
        "F"
      );
  
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
  
      pdf.text(
        "InterviewIQ AI",
        margin + 8,
        y + 11
      );
  
      pdf.setFontSize(13);
  
      pdf.text(
        "Interview Evaluation Report",
        margin + 8,
        y + 20
      );
  
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
  
      pdf.text(
        "AI-powered interview performance analysis",
        margin + 8,
        y + 27
      );
  
      y += 42;
  
      // ------------------------------------------------
      // OVERALL SCORE
      // ------------------------------------------------
  
      addHeading("Overall Performance");
  
      pdf.setFillColor(245, 247, 255);
  
      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        35,
        4,
        4,
        "F"
      );
  
      pdf.setTextColor(79, 70, 229);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
  
      pdf.text(
        `${overallScore}/100`,
        margin + 8,
        y + 16
      );
  
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(12);
  
      pdf.text(
        getScoreLabel(overallScore),
        margin + 8,
        y + 25
      );
  
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
  
      pdf.text(
        "Overall AI Interview Score",
        margin + 65,
        y + 16
      );
  
      y += 45;
  
      // ------------------------------------------------
      // BASIC INFORMATION
      // ------------------------------------------------
  
      addHeading("Interview Details");
  
      const details = [
        ["Role", role],
        ["Experience", experience],
        ["Difficulty", difficulty],
        ["Interview Type", type],
        ["Questions", totalQuestions],
        ["Answered", answeredQuestions],
        ["Duration", formatDuration(duration)],
      ];
  
      details.forEach(([label, value]) => {
        addPageIfNeeded(8);
  
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
  
        pdf.text(`${label}:`, margin, y);
  
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(17, 24, 39);
  
        pdf.text(
          String(value),
          margin + 42,
          y
        );
  
        y += 7;
      });
  
      y += 5;
  
      // ------------------------------------------------
      // PERFORMANCE BREAKDOWN
      // ------------------------------------------------
  
      addHeading("Performance Breakdown");
  
      const scores = [
        ["Communication", communicationScore],
        ["Correctness", correctnessScore],
        ["Confidence", confidenceScore],
      ];
  
      scores.forEach(([label, score]) => {
        addPageIfNeeded(15);
  
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
  
        pdf.text(label, margin, y);
  
        pdf.setFont("helvetica", "normal");
  
        pdf.text(
          `${score}/100`,
          pageWidth - margin - 25,
          y
        );
  
        const barX = margin;
        const barY = y + 3;
        const barWidth = contentWidth;
        const barHeight = 4;
  
        pdf.setFillColor(229, 231, 235);
  
        pdf.roundedRect(
          barX,
          barY,
          barWidth,
          barHeight,
          2,
          2,
          "F"
        );
  
        pdf.setFillColor(79, 70, 229);
  
        pdf.roundedRect(
          barX,
          barY,
          (barWidth * score) / 100,
          barHeight,
          2,
          2,
          "F"
        );
  
        y += 13;
      });
  
      y += 5;
  
      // ------------------------------------------------
      // OVERALL FEEDBACK
      // ------------------------------------------------
  
      addHeading("Overall Feedback");
  
      addText(
        overallFeedback,
        margin,
        10,
        contentWidth,
        5
      );
  
      y += 5;
  
      // ------------------------------------------------
      // STRENGTHS
      // ------------------------------------------------
  
      addHeading("Strengths");
  
      if (strengths.length > 0) {
        strengths.forEach((item) => {
          const text =
            typeof item === "string"
              ? item
              : item?.text ||
                item?.point ||
                item?.description ||
                JSON.stringify(item);
  
          addPageIfNeeded(8);
  
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(34, 197, 94);
  
          pdf.text("•", margin, y);
  
          pdf.setTextColor(17, 24, 39);
  
          addText(
            text,
            margin + 5,
            10,
            contentWidth - 5,
            5
          );
  
          y += 2;
        });
      } else {
        addText(
          "No specific strengths were provided.",
          margin,
          10
        );
      }
  
      y += 5;
  
      // ------------------------------------------------
      // AREAS TO IMPROVE
      // ------------------------------------------------
  
      addHeading("Areas to Improve");
  
      if (weaknesses.length > 0) {
        weaknesses.forEach((item) => {
          const text =
            typeof item === "string"
              ? item
              : item?.text ||
                item?.point ||
                item?.description ||
                JSON.stringify(item);
  
          addPageIfNeeded(8);
  
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(239, 68, 68);
  
          pdf.text("•", margin, y);
  
          pdf.setTextColor(17, 24, 39);
  
          addText(
            text,
            margin + 5,
            10,
            contentWidth - 5,
            5
          );
  
          y += 2;
        });
      } else {
        addText(
          "No specific improvement areas were provided.",
          margin,
          10
        );
      }
  
      y += 5;
  
      // ------------------------------------------------
      // AI SUGGESTIONS
      // ------------------------------------------------
  
      addHeading("AI Suggestions");
  
      if (suggestions.length > 0) {
        suggestions.forEach((item, index) => {
          const text =
            typeof item === "string"
              ? item
              : item?.text ||
                item?.suggestion ||
                item?.description ||
                JSON.stringify(item);
  
          addPageIfNeeded(12);
  
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(79, 70, 229);
  
          pdf.text(
            `${index + 1}.`,
            margin,
            y
          );
  
          pdf.setTextColor(17, 24, 39);
  
          addText(
            text,
            margin + 8,
            10,
            contentWidth - 8,
            5
          );
  
          y += 2;
        });
      } else {
        addText(
          "Continue practicing your interview skills and focus on clear, structured answers.",
          margin,
          10
        );
      }
  
      y += 5;
  
      // ------------------------------------------------
      // QUESTION WISE EVALUATION
      // ------------------------------------------------
  
      addHeading("Question-wise Evaluation");
  
      if (questions.length > 0) {
        questions.forEach((item, index) => {
          const questionScore = getScore(
            item?.score
          );
  
          addPageIfNeeded(30);
  
          pdf.setFillColor(248, 250, 252);
  
          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            8,
            2,
            2,
            "F"
          );
  
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(79, 70, 229);
  
          pdf.text(
            `Question ${index + 1}`,
            margin + 4,
            y + 5
          );
  
          pdf.setTextColor(17, 24, 39);
  
          pdf.text(
            `Score: ${questionScore}/100`,
            pageWidth - margin - 38,
            y + 5
          );
  
          y += 14;
  
          if (item?.category) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(8);
            pdf.setTextColor(107, 114, 128);
  
            pdf.text(
              String(item.category),
              margin,
              y
            );
  
            y += 5;
          }
  
          pdf.setTextColor(17, 24, 39);
  
          addText(
            item?.question ||
              "Question not available",
            margin,
            10,
            contentWidth,
            5
          );
  
          y += 3;
  
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(55, 65, 81);
  
          addText(
            "Your Answer",
            margin,
            9,
            contentWidth,
            5
          );
  
          pdf.setFont("helvetica", "normal");
  
          addText(
            item?.answer &&
              String(item.answer).trim()
              ? item.answer
              : "No answer provided.",
            margin,
            9,
            contentWidth,
            4.5
          );
  
          y += 2;
  
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
  
          addText(
            "AI Feedback",
            margin,
            9,
            contentWidth,
            5
          );
  
          pdf.setFont("helvetica", "normal");
  
          addText(
            item?.feedback ||
              "No detailed feedback available.",
            margin,
            9,
            contentWidth,
            4.5
          );
  
          y += 6;
        });
      } else {
        addText(
          "No question-wise evaluation is available.",
          margin,
          10
        );
      }
  
      // ------------------------------------------------
      // FOOTER ON EVERY PAGE
      // ------------------------------------------------
  
      const totalPages =
        pdf.internal.getNumberOfPages();
  
      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);
  
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
  
        pdf.text(
          "Generated by InterviewIQ AI",
          margin,
          pageHeight - 8
        );
  
        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin - 25,
          pageHeight - 8
        );
      }
  
      // ------------------------------------------------
      // DOWNLOAD
      // ------------------------------------------------
  
      const safeRole = String(
        role || "interview"
      )
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
  
      pdf.save(
        `InterviewIQ-${safeRole}-result.pdf`
      );
    } catch (error) {
      console.error(
        "PDF Download Error:",
        error
      );
  
      alert(
        `Unable to generate PDF.\n\n${
          error?.message || "Unknown error"
        }`
      );
    } finally {
      setDownloading(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading && !interview) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <FaSpinner
            className="text-4xl text-indigo-600 animate-spin mx-auto mb-4"
          />

          <h2 className="text-xl font-semibold text-gray-800">

            Loading your result...

          </h2>

          <p className="text-gray-500 mt-2">

            Please wait while we prepare your AI evaluation.

          </p>

        </div>

      </div>

    );

  }


  // ====================================================
  // ERROR
  // ====================================================

  if (error && !interview) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">

          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">

            <FaExclamationTriangle className="text-2xl text-red-500" />

          </div>


          <h2 className="text-2xl font-bold text-gray-800">

            Result Not Found

          </h2>


          <p className="text-gray-500 mt-3">

            {error}

          </p>


          <button

            onClick={() =>
              navigate("/dashboard")
            }

            className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"

          >

            Back to Dashboard

          </button>

        </div>

      </div>

    );

  }


  if (!interview) {
    return null;
  }


  // ====================================================
  // DATA
  // ====================================================

  const evaluation =
    interview.evaluation || {};


  const overallScore = getScore(
    interview.overallScore ??
      evaluation.overallScore
  );


  const communicationScore = getScore(
    interview.communicationScore ??
      evaluation.communicationScore
  );


  const correctnessScore = getScore(
    interview.correctnessScore ??
      evaluation.correctnessScore
  );


  const confidenceScore = getScore(
    interview.confidenceScore ??
      evaluation.confidenceScore
  );


  const questions = getArray(
    interview.questions ||
      evaluation.questions
  );


  const strengths = getArray(
    interview.strengths ||
      evaluation.strengths
  );


  const weaknesses = getArray(
    interview.weaknesses ||
      evaluation.weaknesses
  );


  const suggestions = getArray(
    interview.suggestions ||
      evaluation.suggestions
  );


  const answeredQuestions =
    interview.answeredQuestions ??
    questions.filter(
      (item) =>
        item?.answer &&
        String(item.answer).trim().length > 0
    ).length;


  const totalQuestions =
    interview.totalQuestions ??
    questions.length;


  const duration =
    interview.duration || 0;


  const role =
    interview.role || "Developer";


  const experience =
    interview.experience || "Fresher";


  const difficulty =
    interview.difficulty || "Medium";


  const type =
    interview.type || "Technical";


  const overallFeedback =
    interview.overallFeedback ||
    evaluation.overallFeedback ||
    "Your interview has been evaluated by InterviewIQ AI.";


  // ====================================================
  // UI
  // ====================================================

  return (

    <div className="min-h-screen bg-gray-50 py-8 px-4">

      <div className="max-w-6xl mx-auto">


        {/* =================================================
            TOP ACTION BAR
        ================================================= */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">

          <button

            onClick={() =>
              navigate("/dashboard")
            }

            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition"

          >

            <FaArrowLeft />

            Back to Dashboard

          </button>


          <button

            onClick={handleDownloadPDF}

            disabled={downloading}

            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"

          >

            {downloading ? (

              <>

                <FaSpinner className="animate-spin" />

                Generating PDF...

              </>

            ) : (

              <>

                <FaDownload />

                Download Report

              </>

            )}

          </button>

        </div>


        {/* =================================================
            REPORT AREA
            ONLY THIS PART WILL BE CONVERTED TO PDF
        ================================================= */}

        <div
          ref={resultRef}
          id="interview-result-report"
          className="bg-gray-50"
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">


            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 sm:px-10 py-10 text-white">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">


                <div>

                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">

                      <FaRobot className="text-2xl" />

                    </div>


                    <div>

                      <p className="text-sm text-indigo-100">

                        InterviewIQ AI

                      </p>


                      <h1 className="text-2xl sm:text-3xl font-bold">

                        Interview Completed

                      </h1>

                    </div>

                  </div>


                  <p className="text-indigo-100 max-w-xl">

                    Your AI-powered interview evaluation is ready.
                    Review your performance, strengths, weaknesses
                    and improvement suggestions below.

                  </p>

                </div>


                <div className="flex flex-col items-center justify-center">

                  <div className="w-36 h-36 rounded-full border-8 border-white/20 flex items-center justify-center bg-white/10">

                    <div className="text-center">

                      <div className="text-4xl font-bold">

                        {overallScore}

                      </div>


                      <div className="text-xs text-indigo-100">

                        OUT OF 100

                      </div>

                    </div>

                  </div>


                  <p className="mt-3 font-semibold">

                    {getScoreLabel(overallScore)}

                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="p-6 sm:p-10">


              {/* =================================================
                  SUMMARY CARDS
              ================================================= */}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">


                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">

                  <FaQuestionCircle className="text-indigo-600 text-xl mb-3" />

                  <p className="text-sm text-gray-500">

                    Questions

                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">

                    {totalQuestions}

                  </p>

                </div>


                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">

                  <FaCheckCircle className="text-green-600 text-xl mb-3" />

                  <p className="text-sm text-gray-500">

                    Answered

                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">

                    {answeredQuestions}

                  </p>

                </div>


                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">

                  <FaClock className="text-orange-500 text-xl mb-3" />

                  <p className="text-sm text-gray-500">

                    Duration

                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">

                    {formatDuration(duration)}

                  </p>

                </div>


                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">

                  <FaTrophy className="text-yellow-500 text-xl mb-3" />

                  <p className="text-sm text-gray-500">

                    Score

                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">

                    {overallScore}/100

                  </p>

                </div>

              </div>


              {/* =================================================
                  INTERVIEW DETAILS
              ================================================= */}

              <section className="mb-10">

                <div className="flex items-center gap-3 mb-5">

                  <FaBriefcase className="text-indigo-600" />

                  <h2 className="text-2xl font-bold text-gray-800">

                    Interview Details

                  </h2>

                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-sm text-gray-500">

                      Role

                    </p>

                    <p className="font-semibold text-gray-800 mt-1">

                      {role}

                    </p>

                  </div>


                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-sm text-gray-500">

                      Experience

                    </p>

                    <p className="font-semibold text-gray-800 mt-1">

                      {experience}

                    </p>

                  </div>


                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-sm text-gray-500">

                      Difficulty

                    </p>

                    <p className="font-semibold text-gray-800 mt-1">

                      {difficulty}

                    </p>

                  </div>


                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-sm text-gray-500">

                      Interview Type

                    </p>

                    <p className="font-semibold text-gray-800 mt-1">

                      {type}

                    </p>

                  </div>

                </div>

              </section>


              {/* =================================================
                  PERFORMANCE BREAKDOWN
              ================================================= */}

              <section className="mb-10">

                <div className="flex items-center gap-3 mb-5">

                  <IoSparkles className="text-purple-600 text-xl" />

                  <h2 className="text-2xl font-bold text-gray-800">

                    Performance Breakdown

                  </h2>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                  <ScoreCard
                    title="Communication"
                    score={communicationScore}
                    icon={
                      <span className="text-indigo-600 font-bold">
                        C
                      </span>
                    }
                  />


                  <ScoreCard
                    title="Correctness"
                    score={correctnessScore}
                    icon={
                      <FaCheckCircle className="text-green-600" />
                    }
                  />


                  <ScoreCard
                    title="Confidence"
                    score={confidenceScore}
                    icon={
                      <FaTrophy className="text-yellow-500" />
                    }
                  />

                </div>

              </section>


              {/* =================================================
                  OVERALL FEEDBACK
              ================================================= */}

              <section className="mb-10">

                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6">

                  <div className="flex items-center gap-3 mb-4">

                    <IoSparkles className="text-indigo-600 text-xl" />

                    <h2 className="text-xl font-bold text-gray-800">

                      Overall Feedback

                    </h2>

                  </div>


                  <p className="text-gray-700 leading-7">

                    {overallFeedback}

                  </p>

                </div>

              </section>


              {/* =================================================
                  STRENGTHS + WEAKNESSES
              ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">


                {/* Strengths */}

                <section className="rounded-2xl border border-green-200 bg-green-50 p-6">

                  <div className="flex items-center gap-3 mb-5">

                    <FaCheckCircle className="text-green-600 text-xl" />

                    <h2 className="text-xl font-bold text-gray-800">

                      Strengths

                    </h2>

                  </div>


                  {strengths.length > 0 ? (

                    <ul className="space-y-3">

                      {strengths.map(
                        (item, index) => (

                          <li
                            key={index}
                            className="flex gap-3 text-gray-700"
                          >

                            <span className="mt-1 text-green-600">

                              <FaCheckCircle />

                            </span>


                            <span>

                              {typeof item === "string"
                                ? item
                                : item?.text ||
                                  item?.point ||
                                  item?.description ||
                                  JSON.stringify(item)}

                            </span>

                          </li>

                        )
                      )}

                    </ul>

                  ) : (

                    <p className="text-gray-600">

                      No specific strengths were provided.

                    </p>

                  )}

                </section>


                {/* Weaknesses */}

                <section className="rounded-2xl border border-red-200 bg-red-50 p-6">

                  <div className="flex items-center gap-3 mb-5">

                    <FaTimesCircle className="text-red-600 text-xl" />

                    <h2 className="text-xl font-bold text-gray-800">

                      Areas to Improve

                    </h2>

                  </div>


                  {weaknesses.length > 0 ? (

                    <ul className="space-y-3">

                      {weaknesses.map(
                        (item, index) => (

                          <li
                            key={index}
                            className="flex gap-3 text-gray-700"
                          >

                            <span className="mt-1 text-red-600">

                              <FaTimesCircle />

                            </span>


                            <span>

                              {typeof item === "string"
                                ? item
                                : item?.text ||
                                  item?.point ||
                                  item?.description ||
                                  JSON.stringify(item)}

                            </span>

                          </li>

                        )
                      )}

                    </ul>

                  ) : (

                    <p className="text-gray-600">

                      No specific improvement areas were provided.

                    </p>

                  )}

                </section>

              </div>


              {/* =================================================
                  AI SUGGESTIONS
              ================================================= */}

              <section className="mb-10">

                <div className="flex items-center gap-3 mb-5">

                  <FaLightbulb className="text-yellow-500 text-xl" />

                  <h2 className="text-2xl font-bold text-gray-800">

                    AI Suggestions

                  </h2>

                </div>


                {suggestions.length > 0 ? (

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {suggestions.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-white"
                        >

                          <div className="w-9 h-9 shrink-0 rounded-lg bg-yellow-50 flex items-center justify-center">

                            <span className="font-bold text-yellow-600">

                              {index + 1}

                            </span>

                          </div>


                          <p className="text-gray-700 leading-6">

                            {typeof item === "string"
                              ? item
                              : item?.text ||
                                item?.suggestion ||
                                item?.description ||
                                JSON.stringify(item)}

                          </p>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="p-5 rounded-xl border border-gray-200 bg-white text-gray-600">

                    Continue practicing your interview skills and
                    focus on clear, structured answers.

                  </div>

                )}

              </section>


              {/* =================================================
                  QUESTION WISE EVALUATION
              ================================================= */}

              <section>

                <div className="flex items-center gap-3 mb-5">

                  <FaQuestionCircle className="text-indigo-600 text-xl" />

                  <h2 className="text-2xl font-bold text-gray-800">

                    Question-wise Evaluation

                  </h2>

                </div>


                {questions.length > 0 ? (

                  <div className="space-y-5">

                    {questions.map(
                      (item, index) => {

                        const questionScore =
                          getScore(item?.score);


                        return (

                          <div
                            key={index}
                            className="rounded-2xl border border-gray-200 bg-white p-6"
                          >

                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">


                              <div className="flex gap-4">

                                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center">

                                  <span className="font-bold text-indigo-600">

                                    {index + 1}

                                  </span>

                                </div>


                                <div>

                                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">

                                    {item?.category ||
                                      "Interview Question"}

                                  </p>


                                  <h3 className="font-semibold text-gray-800 leading-6">

                                    {item?.question ||
                                      "Question not available"}

                                  </h3>

                                </div>

                              </div>


                              <div
                                className={`shrink-0 px-4 py-2 rounded-lg font-bold ${getScoreBg(
                                  questionScore
                                )} ${getScoreColor(
                                  questionScore
                                )}`}
                              >

                                {questionScore}/100

                              </div>

                            </div>


                            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">


                              {/* Answer */}

                              <div className="rounded-xl bg-gray-50 p-4">

                                <p className="text-sm font-semibold text-gray-700 mb-2">

                                  Your Answer

                                </p>


                                <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">

                                  {item?.answer &&
                                  String(
                                    item.answer
                                  ).trim()

                                    ? item.answer

                                    : "No answer provided."}

                                </p>

                              </div>


                              {/* Feedback */}

                              <div className="rounded-xl bg-indigo-50 p-4">

                                <p className="text-sm font-semibold text-gray-700 mb-2">

                                  AI Feedback

                                </p>


                                <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">

                                  {item?.feedback ||
                                    "No detailed feedback available for this question."}

                                </p>

                              </div>

                            </div>


                            {item?.timeTaken !==
                              undefined && (

                              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">

                                <FaClock />

                                <span>

                                  Time taken:{" "}

                                  {formatDuration(
                                    item.timeTaken
                                  )}

                                </span>

                              </div>

                            )}

                          </div>

                        );

                      }
                    )}

                  </div>

                ) : (

                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">

                    <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />

                    <p className="text-gray-500">

                      No question-wise evaluation is available.

                    </p>

                  </div>

                )}

              </section>


              {/* =================================================
                  FINAL MESSAGE
              ================================================= */}

              <div className="mt-10 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6 text-center">

                <IoSparkles className="text-3xl text-indigo-600 mx-auto mb-3" />


                <h2 className="text-xl font-bold text-gray-800">

                  Keep Improving!

                </h2>


                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">

                  Every interview is an opportunity to improve.
                  Review this report, work on the suggested areas,
                  and try another InterviewIQ session.

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            BOTTOM ACTION BUTTONS
            These will NOT be inside PDF
        ================================================= */}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">


          <button

            onClick={() =>
              navigate("/dashboard")
            }

            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"

          >

            <FaArrowLeft />

            Dashboard

          </button>


          <button

            onClick={() =>
              navigate("/interview/config")
            }

            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"

          >

            New Interview

            <FaArrowRight />

          </button>

        </div>

      </div>

    </div>

  );

};


export default InterviewResult;