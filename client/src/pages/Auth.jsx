import React, { useState } from "react";

import { FaRobot } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";

import { auth, provider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

import axios from "axios";

import { ServerUrl } from "../App";

import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Auth() {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    // Prevent multiple popup requests
    if (isLoading) {
      console.log("Google login already in progress...");
      return;
    }

    try {
      setIsLoading(true);

      console.log("1️⃣ Google login started...");

      // Firebase Google Sign-In
      const response = await signInWithPopup(auth, provider);

      console.log("2️⃣ Firebase login successful");

      const user = response.user;

      console.log("Firebase User:", user);

      const name = user.displayName;
      const email = user.email;

      console.log("User Name:", name);
      console.log("User Email:", email);

      console.log("3️⃣ Sending user data to backend...");
      console.log("Backend URL:", ServerUrl);

      // Send user information to backend
      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        {
          name,
          email,
        },
        {
          withCredentials: true,
        }
      );

      console.log("4️⃣ Backend response:", result.data);

      // Save user in Redux
      dispatch(setUserData(result.data));

      console.log("5️⃣ User saved in Redux");

      // Go to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ GOOGLE LOGIN ERROR:", error);
      console.error("❌ ERROR CODE:", error?.code);
      console.error("❌ ERROR MESSAGE:", error?.message);
      console.error(
        "❌ ERROR RESPONSE:",
        error?.response?.data
      );
      console.error(
        "❌ ERROR STATUS:",
        error?.response?.status
      );

      dispatch(setUserData(null));

      // Popup cancellation is generally caused by another
      // popup request being started while one is active.
      if (error?.code === "auth/cancelled-popup-request") {
        console.log(
          "Google popup request was cancelled because another popup request was active."
        );

        alert(
          "Google login popup was cancelled. Please click Continue with Google only once and wait."
        );
      } else {
        alert(
          `Google Login Error:\n\n${
            error?.code ||
            error?.response?.data?.message ||
            error?.message ||
            "Unknown error"
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <FaRobot size={18} />
          </div>

          <h2 className="font-semibold text-lg">
            InterviewIQ.AI
          </h2>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue with{" "}
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8 mr-5 ml-5">
          Sign in to start AI-powered mock interviews, track your
          progress, and unlock detailed performance insights.
        </p>

        {/* Google Login Button */}
        <motion.button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          whileHover={
            !isLoading
              ? { opacity: 0.9, scale: 1.03 }
              : {}
          }
          whileTap={
            !isLoading
              ? { scale: 0.95 }
              : {}
          }
          className={`w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md ${
            isLoading
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          <FcGoogle size={20} />

          {isLoading
            ? "Signing in..."
            : "Continue with Google"}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Auth;