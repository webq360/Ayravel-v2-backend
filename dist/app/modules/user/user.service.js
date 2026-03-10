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
exports.UserServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const config_1 = __importDefault(require("../../config"));
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const customer_model_1 = require("../customer/customer.model");
const order_model_1 = require("../order/order.model");
const vendor_consts_1 = require("../vendor/vendor.consts");
const user_model_1 = require("./user.model");
const getAllUserFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = new QueryBuilder_1.default(user_model_1.UserModel.find(), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield userQuery.modelQuery;
    const meta = yield userQuery.countTotal();
    return { data, meta };
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.UserModel.findById(id);
    //if no user found with the id
    if (!result) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User does not exist!");
    }
    return result;
});
const getAllAdminFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const adminQuery = new QueryBuilder_1.default(user_model_1.UserModel.find({ role: "admin" }), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield adminQuery.modelQuery;
    const meta = yield adminQuery.countTotal();
    return { data, meta };
});
const getAdminProfileFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.UserModel.findById(id);
    if (!result) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User does not exist!");
    }
    if (result.role !== "super-admin") {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized User!");
    }
    return result;
});
const getAllVendorFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorQuery = new QueryBuilder_1.default(user_model_1.UserModel.find({ role: "vendor" }), query)
        .search(vendor_consts_1.VendorSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield vendorQuery.modelQuery;
    const meta = yield vendorQuery.countTotal();
    return { data, meta };
});
const updateUserOnDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.UserModel.findById(id);
    if (!isUserExists) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User does not Exists!");
    }
    // Prevent email update
    if (payload === null || payload === void 0 ? void 0 : payload.email) {
        delete payload.email;
    }
    // Hash password if provided
    if (payload === null || payload === void 0 ? void 0 : payload.password) {
        payload.password = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.bcrypt_salt_rounds));
    }
    const result = yield user_model_1.UserModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    }).select("-password");
    return result;
});
const deletSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.UserModel.findById(id);
    if (!isUserExists) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User does not Exists!");
    }
    yield user_model_1.UserModel.findByIdAndDelete(id);
});
const getUserWithDetailsFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId).select("-password");
    if (!user) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User does not exist!");
    }
    let customerData = null;
    let orders = [];
    let orderMeta = { page: 1, limit: 10, total: 0, totalPage: 0 };
    if (user.role === "customer") {
        customerData = yield customer_model_1.CustomerModel.findOne({ userId }).populate([
            { path: "cartItem.productInfo.productId" },
            { path: "wishlist.products" },
        ]);
        // Find orders by customerId if customer exists, otherwise try userId directly
        const searchId = customerData ? customerData._id : userId;
        const orderQuery = new QueryBuilder_1.default(order_model_1.OrderModel.find({ "orderInfo.orderBy": searchId }), query)
            .filter()
            .sort()
            .paginate()
            .fields();
        orders = yield orderQuery.modelQuery.populate({
            path: "orderInfo.productInfo",
            select: "description.name productInfo.price productInfo.salePrice featuredImg",
        });
        orderMeta = yield orderQuery.countTotal();
    }
    return {
        data: {
            user,
            customer: customerData,
            orders,
        },
        meta: orderMeta,
    };
});
exports.UserServices = {
    getAllUserFromDB,
    getSingleUserFromDB,
    deletSingleUserFromDB,
    getAllAdminFromDB,
    getAllVendorFromDB,
    getAdminProfileFromDB,
    updateUserOnDB,
    getUserWithDetailsFromDB,
};
