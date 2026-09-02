import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
} from "../controllers/payment.controller.js";

import isAuth from "../middlewares/isAuth.js";

const paymentRouter = express.Router();

// =====================================================
// CREATE PAYMENT ORDER
// =====================================================

paymentRouter.post(
  "/create-order",
  isAuth,
  createPaymentOrder
);

// =====================================================
// VERIFY PAYMENT
// =====================================================

paymentRouter.post(
  "/verify",
  isAuth,
  verifyPayment
);

// =====================================================
// PAYMENT HISTORY
// =====================================================

paymentRouter.get(
  "/history",
  isAuth,
  getPaymentHistory
);

export default paymentRouter;