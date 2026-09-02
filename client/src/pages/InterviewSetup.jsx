import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRobot,
  FaClock,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaStop,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";


// =====================================================
// QUESTION TIME CALCULATOR
// =====================================================

const getQuestionTime = (question = "") => {
  const length = question.trim().length;

  if (length > 160) {
    return 120;
  }

  if (length > 80) {
    return 90;
  }

  return 60;
};


// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};


// =====================================================
// INTERVIEW SETUP
// =====================================================

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const interviewData = location.state || {};
  const questions = interviewData.questions || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState(
    questions.map(() => "")
  );

  // ===================================================
  // TIMERS
  // ===================================================

  const TOTAL_INTERVIEW_TIME = 90 * 60;

  const [totalTimeLeft, setTotalTimeLeft] = useState(
    TOTAL_INTERVIEW_TIME
  );

  const [questionTimeLeft, setQuestionTimeLeft] =
    useState(
      questions.length > 0
        ? getQuestionTime(questions[0].question)
        : 60
    );

  // ===================================================
  // UI STATES
  // ===================================================

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const [loadingEvaluation, setLoadingEvaluation] =
    useState(false);

  const [interviewStarted, setInterviewStarted] =
    useState(false);

  const [interviewId, setInterviewId] = useState(
    interviewData.interviewId || null
  );

  const [startingInterview, setStartingInterview] =
    useState(false);

  const [aiMessage, setAiMessage] = useState(
    "Hello! I am your AI interviewer. Let's begin your interview."
  );

  // ===================================================
  // REFS
  // ===================================================

  const recognitionRef = useRef(null);

  const startTimeRef = useRef(Date.now());

  const questionStartTimeRef = useRef(Date.now());

  const interviewStartCalledRef = useRef(false);

  const finishCalledRef = useRef(false);

  // ===================================================
  // CURRENT QUESTION
  // ===================================================

  const currentQuestionData =
    questions[currentQuestion];

  // ===================================================
  // SPEECH SYNTHESIS
  // ===================================================

  const speakText = (text) => {
    if (!text) return;

    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 0.95;

    speech.pitch = 1;

    speech.volume = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  };


  // ===================================================
  // SPEAK QUESTION
  // ===================================================

  const speakQuestion = (question) => {
    if (!question) return;

    setAiMessage(question);

    speakText(question);
  };


  // ===================================================
  // START INTERVIEW IN DATABASE
  // ===================================================

  const createInterview = async () => {
    if (!questions.length) {
      return null;
    }

    if (interviewId) {
      return interviewId;
    }

    if (interviewStartCalledRef.current) {
      return null;
    }

    interviewStartCalledRef.current = true;

    setStartingInterview(true);

    try {
      const response = await axios.post(
        ServerUrl + "/api/interview/start",
        {
          role: interviewData.role,

          experience:
            interviewData.experience,

          difficulty:
            interviewData.difficulty,

          type: interviewData.type,

          questions,

          resumeAnalysis:
            interviewData.resumeAnalysis || null,
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to start interview"
        );
      }

      const newInterviewId =
        response.data.interviewId;

      setInterviewId(newInterviewId);

      return newInterviewId;
    } catch (error) {
      console.error(
        "Start Interview Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Unable to start interview. Please try again."
      );

      interviewStartCalledRef.current = false;

      return null;
    } finally {
      setStartingInterview(false);
    }
  };


  // ===================================================
  // START INTERVIEW
  // ===================================================

  useEffect(() => {
    if (!questions.length) {
      return;
    }

    let mounted = true;

    const initializeInterview = async () => {
      const createdInterviewId =
        await createInterview();

      if (!mounted || !createdInterviewId) {
        return;
      }

      setInterviewStarted(true);

      startTimeRef.current = Date.now();

      questionStartTimeRef.current = Date.now();

      const greeting = `
Hello ${
        interviewData.name || "Anjali"
      }.

Welcome to your ${
        interviewData.type || "AI"
      } interview.

I will ask you ${
        questions.length
      } questions.

Please answer each question clearly.

Let's begin your interview.
      `.trim();

      speakText(greeting);

      const timer = setTimeout(() => {
        if (mounted) {
          speakQuestion(
            questions[0].question
          );
        }
      }, 4500);

      return () => {
        clearTimeout(timer);
      };
    };

    initializeInterview();

    return () => {
      mounted = false;

      window.speechSynthesis.cancel();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  // ===================================================
  // TOTAL INTERVIEW TIMER
  // ===================================================

  useEffect(() => {
    if (!interviewStarted) {
      return;
    }

    if (totalTimeLeft <= 0) {
      finishInterview();
      return;
    }

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    interviewStarted,
    totalTimeLeft,
  ]);


  // ===================================================
  // QUESTION TIMER
  // ===================================================

  useEffect(() => {
    if (
      !interviewStarted ||
      !questions.length ||
      loadingEvaluation
    ) {
      return;
    }

    if (questionTimeLeft <= 0) {
      handleQuestionTimeout();
      return;
    }

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    interviewStarted,
    currentQuestion,
    questionTimeLeft,
    loadingEvaluation,
  ]);


  // ===================================================
  // SPEECH RECOGNITION
  // ===================================================

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript +=
            transcript + " ";
        }
      }

      if (finalTranscript) {
        setAnswers((prev) => {
          const updated = [...prev];

          updated[currentQuestion] = `
            ${updated[currentQuestion] || ""}
            ${finalTranscript}
          `
            .replace(/\s+/g, " ")
            .trim();

          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      console.log(
        "Speech Recognition Error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.log(
        "Speech Recognition Start Error:",
        error
      );

      setIsListening(false);
    }
  };


  // ===================================================
  // STOP LISTENING
  // ===================================================

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Stop Recognition Error:",
          error
        );
      }
    }

    setIsListening(false);
  };


  // ===================================================
  // ANSWER CHANGE
  // ===================================================

  const handleAnswerChange = (value) => {
    setAnswers((prev) => {
      const updated = [...prev];

      updated[currentQuestion] = value;

      return updated;
    });
  };


  // ===================================================
  // QUESTION TIMEOUT
  // ===================================================

  const handleQuestionTimeout = () => {
    if (loadingEvaluation) {
      return;
    }

    stopListening();

    speakText(
      "Your time for this question is over. Let's move to the next question."
    );

    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };


  // ===================================================
  // MOVE NEXT QUESTION
  // ===================================================

  const moveToNextQuestion = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      const nextQuestion =
        currentQuestion + 1;

      setCurrentQuestion(nextQuestion);

      const nextTime =
        getQuestionTime(
          questions[nextQuestion].question
        );

      setQuestionTimeLeft(nextTime);

      questionStartTimeRef.current =
        Date.now();

      setTimeout(() => {
        speakQuestion(
          questions[nextQuestion].question
        );
      }, 300);

      return;
    }

    finishInterview();
  };


  // ===================================================
  // NEXT BUTTON
  // ===================================================

  const handleNext = () => {
    if (loadingEvaluation) {
      return;
    }

    if (!answers[currentQuestion]?.trim()) {
      alert(
        "Please answer the question before continuing."
      );

      return;
    }

    stopListening();

    moveToNextQuestion();
  };


  // ===================================================
  // PREVIOUS QUESTION
  // ===================================================

  const handlePrevious = () => {
    if (
      currentQuestion === 0 ||
      loadingEvaluation
    ) {
      return;
    }

    stopListening();

    const previousQuestion =
      currentQuestion - 1;

    setCurrentQuestion(
      previousQuestion
    );

    setQuestionTimeLeft(
      getQuestionTime(
        questions[previousQuestion].question
      )
    );

    questionStartTimeRef.current =
      Date.now();

    speakQuestion(
      questions[previousQuestion].question
    );
  };


  // ===================================================
  // FINISH INTERVIEW
  // ===================================================

  const finishInterview = async () => {
    if (
      loadingEvaluation ||
      finishCalledRef.current
    ) {
      return;
    }

    finishCalledRef.current = true;

    stopListening();

    window.speechSynthesis.cancel();

    setIsSpeaking(false);

    setLoadingEvaluation(true);

    const duration = Math.floor(
      (Date.now() - startTimeRef.current) /
        1000
    );

    const formattedAnswers =
      questions.map(
        (question, index) => ({
          question:
            question.question,

          category:
            question.category ||
            "Interview",

          answer:
            answers[index] || "",

          timeTaken: 0,
        })
      );

    try {
      let finalInterviewId =
        interviewId;

      // =================================================
      // SAFETY: CREATE INTERVIEW IF NOT CREATED
      // =================================================

      if (!finalInterviewId) {
        finalInterviewId =
          await createInterview();
      }

      const response = await axios.post(
        ServerUrl +
          "/api/interview/evaluate",
        {
          interviewId:
            finalInterviewId || null,

          role:
            interviewData.role,

          experience:
            interviewData.experience,

          difficulty:
            interviewData.difficulty,

          type:
            interviewData.type,

          answers:
            formattedAnswers,

          duration,
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Interview evaluation failed"
        );
      }

      const evaluation =
        response.data.evaluation;

      navigate(
        "/interview/result",
        {
          state: {
            interviewData: {
              ...interviewData,

              interviewId:
                response.data.interviewId ||
                finalInterviewId,
            },

            answers:
              formattedAnswers,

            totalQuestions:
              questions.length,

            duration,

            evaluation,
          },
        }
      );
    } catch (error) {
      console.error(
        "Interview Evaluation Error:",
        error.response?.data ||
          error
      );

      alert(
        error.response?.data?.message ||
          "Unable to evaluate interview. Please try again."
      );

      finishCalledRef.current =
        false;

      setLoadingEvaluation(false);
    }
  };


  // ===================================================
  // EXIT INTERVIEW
  // ===================================================

  const handleExitInterview = () => {
    if (loadingEvaluation) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to exit this interview? Your current progress may be lost."
    );

    if (!confirmed) {
      return;
    }

    stopListening();

    window.speechSynthesis.cancel();

    navigate("/interview/config");
  };


  // ===================================================
  // NO INTERVIEW
  // ===================================================

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center max-w-md">
          <FaRobot
            size={35}
            className="mx-auto mb-4 text-gray-700"
          />

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Interview Found
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Please start a new interview to
            generate AI questions.
          </p>

          <button
            onClick={() =>
              navigate(
                "/interview/config"
              )
            }
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }


  // ===================================================
  // STARTING INTERVIEW SCREEN
  // ===================================================

  if (
    !interviewStarted &&
    startingInterview
  ) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center max-w-md">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-black text-white flex items-center justify-center"
          >
            <FaRobot size={40} />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900">
            Preparing Your Interview
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Setting up your AI interviewer...
          </p>

          <div className="mt-6 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              animate={{
                width: ["20%", "80%", "95%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }


  // ===================================================
  // PROGRESS
  // ===================================================

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  const questionMaximumTime =
    getQuestionTime(
      currentQuestionData?.question ||
        ""
    );

  const questionTimerProgress =
    questionMaximumTime > 0
      ? (questionTimeLeft /
          questionMaximumTime) *
        100
      : 0;


  // ===================================================
  // RETURN UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-8">
      <div className="max-w-6xl mx-auto">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <button
            onClick={handleExitInterview}
            disabled={loadingEvaluation}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition disabled:opacity-40"
          >
            <FaArrowLeft size={14} />

            Exit Interview
          </button>


          {/* Overall Timer */}

          <div
            className={`flex items-center gap-2 px-5 py-3 rounded-full border font-semibold ${
              totalTimeLeft <= 300
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            <FaClock size={14} />

            <span>
              Total Time:{" "}
              {formatTime(
                totalTimeLeft
              )}
            </span>
          </div>

        </div>


        {/* =================================================
            INTERVIEW INFO
        ================================================= */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 mb-2">
                <IoSparkles className="text-green-500" />

                <span className="text-green-600 text-sm font-medium">
                  {interviewData.type ||
                    "AI Interview"}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                {interviewData.role ||
                  "Developer"}{" "}
                Interview
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {interviewData.experience ||
                  "Fresher"}{" "}
                •{" "}
                {interviewData.difficulty ||
                  "Medium"}
              </p>

            </div>


            <div className="bg-black text-white px-6 py-4 rounded-2xl text-center">

              <p className="text-xs text-gray-400">
                QUESTION
              </p>

              <p className="font-semibold text-lg">
                {currentQuestion + 1} /{" "}
                {questions.length}
              </p>

            </div>

          </div>


          {/* Progress */}

          <div className="mt-6">

            <div className="flex justify-between text-xs text-gray-500 mb-2">

              <span>
                Interview Progress
              </span>

              <span>
                {Math.round(
                  progress
                )}
                %
              </span>

            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="h-full bg-green-500 rounded-full"
              />

            </div>

          </div>

        </div>


        {/* =================================================
            MAIN INTERVIEW AREA
        ================================================= */}

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">


          {/* =================================================
              AI INTERVIEWER
          ================================================= */}

          <div className="bg-black text-white rounded-3xl p-6 flex flex-col items-center justify-center min-h-[430px]">

            <div className="relative mb-6">

              {/* Glow */}

              <div
                className={`absolute inset-0 rounded-full blur-2xl ${
                  isSpeaking
                    ? "bg-green-400/40"
                    : isListening
                    ? "bg-blue-400/40"
                    : "bg-blue-400/20"
                }`}
              />


              {/* Avatar */}

              <motion.div
                animate={{
                  y: isSpeaking
                    ? [0, -8, 0]
                    : [0, -3, 0],

                  rotate: isSpeaking
                    ? [-2, 2, -2]
                    : 0,

                  scale: isListening
                    ? [1, 1.03, 1]
                    : 1,
                }}
                transition={{
                  duration: isSpeaking
                    ? 0.8
                    : 2,

                  repeat: Infinity,
                }}
                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 border-4 border-white/20 shadow-2xl flex items-center justify-center"
              >

                <div className="w-28 h-28 rounded-full bg-gray-900 relative">

                  {/* Eyes */}

                  <div className="absolute top-9 left-7 w-4 h-4 bg-white rounded-full">
                    <div className="w-2 h-2 bg-black rounded-full mx-auto mt-1" />
                  </div>

                  <div className="absolute top-9 right-7 w-4 h-4 bg-white rounded-full">
                    <div className="w-2 h-2 bg-black rounded-full mx-auto mt-1" />
                  </div>


                  {/* Mouth */}

                  <motion.div
                    animate={{
                      scaleY: isSpeaking
                        ? [1, 0.3, 1]
                        : 1,
                      scaleX: isSpeaking
                        ? [1, 0.8, 1]
                        : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                    }}
                    className="absolute bottom-7 left-1/2 -translate-x-1/2 w-10 h-3 bg-white rounded-full"
                  />

                </div>

              </motion.div>

            </div>


            {/* AI Name */}

            <div className="text-center">

              <div className="flex items-center justify-center gap-2 mb-2">

                <IoSparkles className="text-green-400" />

                <span className="font-semibold">
                  InterviewIQ AI
                </span>

              </div>

              <p className="text-gray-400 text-sm">
                {isSpeaking
                  ? "AI is speaking..."
                  : isListening
                  ? "Listening to you..."
                  : "Your AI Interviewer"}
              </p>

            </div>


            {/* AI Message */}

            <div className="w-full mt-5 bg-white/10 border border-white/10 rounded-xl p-3">

              <p className="text-xs text-gray-400 mb-1">
                AI
              </p>

              <p className="text-sm text-gray-200 leading-relaxed line-clamp-4">
                {aiMessage}
              </p>

            </div>


            {/* Voice button */}

            <button
              onClick={() =>
                speakQuestion(
                  currentQuestionData.question
                )
              }
              disabled={loadingEvaluation}
              className="mt-5 flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              <FaVolumeUp size={14} />

              Repeat Question
            </button>

          </div>


          {/* =================================================
              QUESTION CARD
          ================================================= */}

          <motion.div
            key={currentQuestion}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10"
          >

            {/* Question Header */}

            <div className="flex items-center justify-between mb-6">

              <div className="inline-block bg-green-100 text-green-600 text-xs font-medium px-3 py-1.5 rounded-full">
                {currentQuestionData.category ||
                  "Interview"}
              </div>


              <div
                className={`flex items-center gap-2 font-semibold ${
                  questionTimeLeft <= 10
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                <FaClock size={14} />

                {questionTimeLeft}s
              </div>

            </div>


            {/* Question Timer Progress */}

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">

              <motion.div
                animate={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      questionTimerProgress
                    )
                  )}%`,
                }}
                transition={{
                  duration: 0.3,
                }}
                className={`h-full rounded-full ${
                  questionTimeLeft <= 10
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              />

            </div>


            {/* Question */}

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-relaxed mb-8">
              {currentQuestionData.question}
            </h2>


            {/* Answer */}

            <div>

              <div className="flex items-center justify-between mb-3">

                <label className="text-sm font-medium text-gray-700">
                  Your Answer
                </label>

                <span className="text-xs text-gray-400">
                  {
                    (
                      answers[
                        currentQuestion
                      ] || ""
                    ).length
                  }{" "}
                  characters
                </span>

              </div>


              <textarea
                value={
                  answers[
                    currentQuestion
                  ] || ""
                }
                onChange={(e) =>
                  handleAnswerChange(
                    e.target.value
                  )
                }
                placeholder="Type your answer here or use the microphone..."
                rows={8}
                disabled={loadingEvaluation}
                className="w-full border border-gray-200 rounded-2xl p-5 resize-none outline-none focus:border-black transition text-gray-700 leading-relaxed disabled:bg-gray-50"
              />


              {/* Microphone */}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">

                <p className="text-xs text-gray-400">
                  You can type your answer or speak using the microphone.
                </p>


                <button
                  onClick={
                    isListening
                      ? stopListening
                      : startListening
                  }
                  disabled={
                    loadingEvaluation
                  }
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition disabled:opacity-50 ${
                    isListening
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >

                  {isListening ? (
                    <>
                      <FaMicrophoneSlash />

                      Stop Recording
                    </>
                  ) : (
                    <>
                      <FaMicrophone />

                      Answer with Mic
                    </>
                  )}

                </button>

              </div>

            </div>


            {/* Buttons */}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">

              {/* Previous */}

              <button
                onClick={handlePrevious}
                disabled={
                  currentQuestion === 0 ||
                  loadingEvaluation
                }
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition ${
                  currentQuestion === 0 ||
                  loadingEvaluation
                    ? "text-gray-300 border-gray-100 cursor-not-allowed"
                    : "text-gray-700 border-gray-200 hover:border-gray-400"
                }`}
              >
                <FaArrowLeft size={13} />

                Previous
              </button>


              {/* Next / Finish */}

              {currentQuestion ===
              questions.length - 1 ? (
                <button
                  onClick={
                    finishInterview
                  }
                  disabled={
                    loadingEvaluation
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-60"
                >

                  {loadingEvaluation
                    ? "Analyzing Interview..."
                    : "Finish Interview"}

                  {!loadingEvaluation && (
                    <FaStop size={12} />
                  )}

                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={
                    loadingEvaluation
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-60"
                >
                  Next Question

                  <FaArrowRight
                    size={13}
                  />
                </button>
              )}

            </div>

          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default InterviewSetup;