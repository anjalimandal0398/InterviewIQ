import React, { useEffect } from "react";

import { Routes, Route } from "react-router-dom";

import axios from "axios";

import { useDispatch } from "react-redux";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InterviewConfig from "./pages/InterviewConfig";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewResult from "./pages/InterviewResult";
import InterviewHistory from "./pages/InterviewHistory";
import Profile from "./pages/Profile";
import Credits from "./pages/Credits";
import ResumeAnalysis from "./pages/ResumeAnalysis/ResumeAnalysis";

import { setUserData } from "./redux/userSlice";

// Local development + production backend URL
export const ServerUrl =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          `${ServerUrl}/api/user/current-user`,
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(
          "Current User Error:",
          error.response?.data || error
        );

        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/auth" element={<Auth />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Resume Analysis */}
      <Route path="/resume" element={<ResumeAnalysis />} />

      <Route
        path="/resume-analysis"
        element={<ResumeAnalysis />}
      />

      {/* Interview Configuration */}
      <Route
        path="/interview/config"
        element={<InterviewConfig />}
      />

      {/* Interview Setup */}
      <Route
        path="/interview/setup"
        element={<InterviewSetup />}
      />

      {/* Interview Result */}
      <Route
        path="/interview/result"
        element={<InterviewResult />}
      />

      {/* Interview Result With ID */}
      <Route
        path="/interview/result/:id"
        element={<InterviewResult />}
      />

      {/* Interview History */}
      <Route
        path="/history"
        element={<InterviewHistory />}
      />

      <Route
        path="/interview/history"
        element={<InterviewHistory />}
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={<Profile />}
      />

      {/* Credits */}
      <Route
        path="/credits"
        element={<Credits />}
      />
    </Routes>
  );
}

export default App;