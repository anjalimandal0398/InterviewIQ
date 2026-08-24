import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InterviewConfig from "./pages/InterviewConfig";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewResult from "./pages/InterviewResult";

import { setUserData } from "./redux/userSlice";

export const ServerUrl = "http://localhost:8000";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error.response?.data);
        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>

      {/* Home */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* Authentication */}
      <Route
        path="/auth"
        element={<Auth />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
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

    </Routes>
  );
}

export default App;