import axios from "axios";
import { steadfastConfig } from "../../config/steadfast.config";

// Create dedicated Steadfast axios client
const steadfastClient = axios.create({
  baseURL: steadfastConfig.baseURL,
  headers: {
    "Api-Key": steadfastConfig.apiKey,
    "Secret-Key": steadfastConfig.secretKey,
    "Content-Type": "application/json",
  },
});

// Log configuration on initialization

// ✅ 1️⃣ Create single order
export const createOrder = async (orderData: any) => {
  try {
   
    const { data } = await steadfastClient.post("/create_order", orderData);
    
    return data;
  } catch (error: any) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Invalid Steadfast API credentials. Please verify API Key and Secret Key.');
    }
    
    if (error.response?.status === 422) {
      const validationErrors = error.response?.data?.errors || error.response?.data;
      throw new Error(`Validation Error: ${JSON.stringify(validationErrors)}`);
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Steadfast API request failed';
    throw new Error(errorMessage);
  }
};

// ✅ 2️⃣ Bulk order creation (max 500)
export const bulkCreateOrders = async (orders: any[]) => {
  try {
    const payload = { data: orders };
    const { data } = await steadfastClient.post("/create_order/bulk-order", payload);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create bulk orders');
  }
};

// ✅ 3️⃣ Check delivery status (by consignment ID)
export const getStatusByConsignmentId = async (id: string | number) => {
  try {
    const { data } = await steadfastClient.get(`/status_by_cid/${id}`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch status by consignment ID');
  }
};

// ✅ 4️⃣ Check delivery status (by invoice)
export const getStatusByInvoice = async (invoice: string) => {
  try {
    const { data } = await steadfastClient.get(`/status_by_invoice/${invoice}`);
    return data;
  } catch (error: any) {
    throw error.response?.data || new Error(error.response?.data?.message || error.message || 'Failed to fetch status by invoice');
  }
};

// ✅ 5️⃣ Check delivery status (by tracking code)
export const getStatusByTrackingCode = async (trackingCode: string) => {
  try {
    const { data } = await steadfastClient.get(`/status_by_trackingcode/${trackingCode}`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch status by tracking code');
  }
};

// ✅ 6️⃣ Get current balance
export const getCurrentBalance = async () => {
  try {
    const { data } = await steadfastClient.get("/get_balance");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch balance');
  }
};

// ✅ 7️⃣ Create return request
export const createReturnRequest = async (payload: {
  consignment_id?: number;
  invoice?: string;
  tracking_code?: string;
  reason?: string;
}) => {
  const { data } = await steadfastClient.post("/create_return_request", payload);
  return data;
};

// ✅ 8️⃣ Get single return request
export const getReturnRequest = async (id: string | number) => {
  const { data } = await steadfastClient.get(`/get_return_request/${id}`);
  return data;
};

// ✅ 9️⃣ Get all return requests
export const getReturnRequests = async () => {
  const { data } = await steadfastClient.get("/get_return_requests");
  return data;
};

// ✅ 🔟 Get payments
export const getPayments = async () => {
  const { data } = await steadfastClient.get("/payments");
  return data;
};

// ✅ 1️⃣1️⃣ Get single payment with consignments
export const getPaymentById = async (paymentId: string | number) => {
  const { data } = await steadfastClient.get(`/payments/${paymentId}`);
  return data;
};

// ✅ 1️⃣2️⃣ Get police stations
export const getPoliceStations = async () => {
  const { data } = await steadfastClient.get("/police_stations");
  return data;
};
