import axios from "axios";

const ServerUrl = "http://localhost:8000";

const paymentApi = axios.create({
  baseURL: ServerUrl + "/api/payment",
  withCredentials: true,
});

// =====================================================
// CREATE ORDER
// =====================================================

export const createPaymentOrder = async (plan) => {
  const response = await paymentApi.post(
    "/create-order",
    {
      plan,
    }
  );

  return response.data;
};

// =====================================================
// VERIFY PAYMENT
// =====================================================

export const verifyPayment = async (paymentData) => {
  const response = await paymentApi.post(
    "/verify",
    paymentData
  );

  return response.data;
};

// =====================================================
// PAYMENT HISTORY
// =====================================================

export const getPaymentHistory = async () => {
  const response = await paymentApi.get(
    "/history"
  );

  return response.data;
};

export default paymentApi;