import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

import User from "../models/user.js";
import Payment from "../models/payment.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// CREDIT PLANS
// =====================================================

const PLANS = {
  starter: {
    credits: 200,
    amount: 100,
  },

  pro: {
    credits: 500,
    amount: 200,
  },
};

// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

export const createPaymentOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid credit plan",
      });
    }

    const selectedPlan = PLANS[plan];

    const options = {
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `credit_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: req.userId,
      razorpayOrderId: order.id,
      plan,
      credits: selectedPlan.credits,
      amount: selectedPlan.amount,
      currency: "INR",
      status: "created",
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      credits: selectedPlan.credits,
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

// =====================================================
// VERIFY PAYMENT
// =====================================================

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    // =================================================
    // FIND PAYMENT
    // =================================================

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    // =================================================
    // PREVENT DUPLICATE CREDIT
    // =================================================

    if (payment.status === "paid") {
      const user = await User.findById(req.userId);

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        credits: user?.credits || 0,
      });
    }

    // =================================================
    // GENERATE SIGNATURE
    // =================================================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // =================================================
    // VERIFY SIGNATURE
    // =================================================

    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // =================================================
    // ADD CREDITS
    // =================================================

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.credits += payment.credits;

    await user.save();

    // =================================================
    // UPDATE PAYMENT
    // =================================================

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";

    await payment.save();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Payment successful and credits added",
      addedCredits: payment.credits,
      totalCredits: user.credits,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

// =====================================================
// GET PAYMENT HISTORY
// =====================================================

export const getPaymentHistory = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const payments = await Payment.find({
      user: req.userId,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Payment History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payment history",
    });
  }
};