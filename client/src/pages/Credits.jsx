import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaCrown,
  FaBolt,
  FaGift,
} from "react-icons/fa";

import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentApi";

const Credits = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const userData =
    user?.userData ||
    user?.user ||
    user;

  const [credits, setCredits] = useState(
    userData?.credits ?? 100
  );

  const [loadingPlan, setLoadingPlan] = useState("");

  // =====================================================
  // UPDATE CREDITS FROM REDUX
  // =====================================================

  useEffect(() => {
    if (userData?.credits !== undefined) {
      setCredits(userData.credits);
    }
  }, [userData?.credits]);

  // =====================================================
  // LOAD RAZORPAY SCRIPT
  // =====================================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // BUY CREDITS
  // =====================================================

  const handleBuyCredits = async (plan) => {
    try {
      setLoadingPlan(plan);

      // Load Razorpay
      const loaded = await loadRazorpay();

      if (!loaded) {
        alert(
          "Unable to load Razorpay. Please check your internet connection."
        );
        return;
      }

      // Create order
      const orderData = await createPaymentOrder(plan);

      console.log("Order Response:", orderData);

      if (!orderData.success) {
        alert(
          orderData.message ||
            "Unable to create payment order."
        );
        return;
      }

      // =================================================
      // RAZORPAY OPTIONS
      // =================================================

      const options = {
        key: orderData.keyId,

        amount: orderData.amount,

        currency: orderData.currency || "INR",

        name: "InterviewIQ",

        description:
          `${orderData.credits} Interview Credits`,

        order_id: orderData.orderId,

        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
        },

        theme: {
          color: "#000000",
        },

        handler: async function (response) {
          try {
            console.log(
              "Razorpay Payment Response:",
              response
            );

            const verification = await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            });

            console.log(
              "Payment Verification:",
              verification
            );

            if (!verification.success) {
              alert(
                verification.message ||
                  "Payment verification failed."
              );
              return;
            }

            // Update credits on screen
            setCredits(
              verification.totalCredits
            );

            alert(
              `${verification.addedCredits} credits added successfully!`
            );

            // Refresh dashboard/user data
            window.location.href = "/dashboard";

          } catch (error) {
            console.error(
              "Payment Verification Error:",
              error
            );

            alert(
              error.response?.data?.message ||
                "Payment verification failed."
            );
          }
        },

        modal: {
          ondismiss: function () {
            setLoadingPlan("");
          },
        },
      };

      // =================================================
      // OPEN RAZORPAY
      // =================================================

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay Payment Failed:",
            response
          );

          alert(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setLoadingPlan("");
        }
      );

      razorpay.open();

    } catch (error) {
      console.error(
        "Buy Credits Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to start payment."
      );
    } finally {
      setLoadingPlan("");
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-10">

      <div className="w-full max-w-5xl mx-auto">

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <FaArrowLeft size={14} />

          <span className="text-sm font-medium">
            Back to Dashboard
          </span>
        </button>

        {/* HEADER */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 md:p-10 mb-6 text-center">

          <div className="flex justify-center mb-4">

            <div className="bg-black text-white p-4 rounded-2xl">
              <FaBolt size={25} />
            </div>

          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Interview Credits
          </h1>

          <p className="text-gray-500 mt-2">
            Buy credits and continue practicing
            AI interviews.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 bg-gray-100 px-5 py-3 rounded-2xl">

            <FaBolt className="text-yellow-500" />

            <span className="text-sm text-gray-500">
              Available Credits
            </span>

            <span className="font-bold text-gray-900 text-lg">
              {credits}
            </span>

          </div>

        </div>

        {/* PRICING */}

        <div className="grid md:grid-cols-3 gap-5">

          {/* ================= FREE ================= */}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">

            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-5">
              <FaGift />
            </div>

            <h2 className="text-xl font-bold">
              Free
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Get started with InterviewIQ
            </p>

            <div className="mt-6">
              <span className="text-4xl font-bold">
                ₹0
              </span>
            </div>

            <div className="mt-6 space-y-3">

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-500 mt-0.5" />
                100 Credits
              </div>

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-500 mt-0.5" />
                AI Interviews
              </div>

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-500 mt-0.5" />
                Basic Features
              </div>

            </div>

            <button
              disabled
              className="w-full mt-7 bg-gray-100 text-gray-500 py-3 rounded-xl font-medium"
            >
              Included
            </button>

          </div>

          {/* ================= STARTER ================= */}

          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-7">

            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5">
              <FaBolt />
            </div>

            <h2 className="text-xl font-bold">
              Starter
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              For regular interview practice
            </p>

            <div className="mt-6">
              <span className="text-4xl font-bold">
                ₹100
              </span>
            </div>

            <div className="mt-6 space-y-3">

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-500 mt-0.5" />
                200 Credits
              </div>

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-500 mt-0.5" />
                AI Interviews
              </div>

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-500 mt-0.5" />
                Resume Based Interviews
              </div>

            </div>

            <button
              onClick={() =>
                handleBuyCredits("starter")
              }
              disabled={loadingPlan === "starter"}
              className="w-full mt-7 bg-black text-white py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {loadingPlan === "starter"
                ? "Processing..."
                : "Buy 200 Credits"}
            </button>

          </div>

          {/* ================= PRO ================= */}

          <div className="bg-black text-white rounded-3xl shadow-sm p-7 relative overflow-hidden">

            <div className="absolute top-5 right-5 bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>

            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
              <FaCrown />
            </div>

            <h2 className="text-xl font-bold">
              Pro
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              For serious interview preparation
            </p>

            <div className="mt-6">
              <span className="text-4xl font-bold">
                ₹200
              </span>
            </div>

            <div className="mt-6 space-y-3">

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                500 Credits
              </div>

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                AI Interviews
              </div>

              <div className="flex gap-2 text-sm">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                Resume Based Interviews
              </div>

            </div>

            <button
              onClick={() =>
                handleBuyCredits("pro")
              }
              disabled={loadingPlan === "pro"}
              className="w-full mt-7 bg-white text-black py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {loadingPlan === "pro"
                ? "Processing..."
                : "Buy 500 Credits"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Credits;