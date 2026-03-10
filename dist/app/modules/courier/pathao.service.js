"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderInfo = exports.createOrder = exports.getAreasByZone = exports.getZonesByCity = exports.getCities = exports.getStores = exports.createStore = exports.issueToken = void 0;
const axios_1 = __importDefault(require("axios"));
const pathao_config_1 = require("../../config/pathao.config");
let cachedToken = null;
let tokenExpiry = 0;
const client = axios_1.default.create({
    baseURL: pathao_config_1.pathaoConfig.baseURL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
// ✅ 1️⃣ Issue Token (with caching)
const issueToken = () => __awaiter(void 0, void 0, void 0, function* () {
    if (cachedToken && Date.now() < tokenExpiry) {
        return { access_token: cachedToken };
    }
    const { data } = yield axios_1.default.post(`${pathao_config_1.pathaoConfig.baseURL}/issue-token`, {
        client_id: pathao_config_1.pathaoConfig.clientId,
        client_secret: pathao_config_1.pathaoConfig.clientSecret,
        username: pathao_config_1.pathaoConfig.username,
        password: pathao_config_1.pathaoConfig.password,
        grant_type: pathao_config_1.pathaoConfig.grantType,
    });
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in || 432000) * 1000;
    return data;
});
exports.issueToken = issueToken;
// Helper to get valid token
const getToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = yield (0, exports.issueToken)();
    return tokenData.access_token;
});
// ✅ 2️⃣ Create Store
const createStore = (storeData) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.post("/stores", storeData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.createStore = createStore;
// ✅ 3️⃣ Get Stores
const getStores = () => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.get("/stores", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.getStores = getStores;
// ✅ 4️⃣ Get Cities
const getCities = () => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.get("/city-list", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.getCities = getCities;
// ✅ 5️⃣ Get Zones by City
const getZonesByCity = (cityId) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.get(`/cities/${cityId}/zone-list`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.getZonesByCity = getZonesByCity;
// ✅ 6️⃣ Get Areas by Zone
const getAreasByZone = (zoneId) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.get(`/zones/${zoneId}/area-list`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.getAreasByZone = getAreasByZone;
// ✅ 7️⃣ Create Order
const createOrder = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.post("/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.createOrder = createOrder;
// ✅ 8️⃣ Get Order Info
const getOrderInfo = (consignmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getToken();
    const { data } = yield client.get(`/orders/${consignmentId}/info`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
});
exports.getOrderInfo = getOrderInfo;
