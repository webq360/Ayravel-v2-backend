import axios from "axios";
import { pathaoConfig } from "../../config/pathao.config";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const client = axios.create({
  baseURL: pathaoConfig.baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ 1️⃣ Issue Token (with caching)
export const issueToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return { access_token: cachedToken };
  }

  const { data } = await axios.post(
    `${pathaoConfig.baseURL}/issue-token`,
    {
      client_id: pathaoConfig.clientId,
      client_secret: pathaoConfig.clientSecret,
      username: pathaoConfig.username,
      password: pathaoConfig.password,
      grant_type: pathaoConfig.grantType,
    }
  );

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in || 432000) * 1000;

  return data;
};

// Helper to get valid token
const getToken = async () => {
  const tokenData = await issueToken();
  return tokenData.access_token;
};

// ✅ 2️⃣ Create Store
export const createStore = async (storeData: any) => {
  const token = await getToken();
  const { data } = await client.post("/stores", storeData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ 3️⃣ Get Stores
export const getStores = async () => {
  const token = await getToken();
  const { data } = await client.get("/stores", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ 4️⃣ Get Cities
export const getCities = async () => {
  const token = await getToken();
  const { data } = await client.get("/city-list", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ 5️⃣ Get Zones by City
export const getZonesByCity = async (cityId: string | number) => {
  const token = await getToken();
  const { data } = await client.get(`/cities/${cityId}/zone-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ 6️⃣ Get Areas by Zone
export const getAreasByZone = async (zoneId: string | number) => {
  const token = await getToken();
  const { data } = await client.get(`/zones/${zoneId}/area-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ 7️⃣ Create Order
export const createOrder = async (orderData: any) => {
  const token = await getToken();
  const { data } = await client.post("/orders", orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ 8️⃣ Get Order Info
export const getOrderInfo = async (consignmentId: string) => {
  const token = await getToken();
  const { data } = await client.get(`/orders/${consignmentId}/info`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
