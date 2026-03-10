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
exports.orderServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const product_model_1 = require("../product/product.model");
const order_consts_1 = require("./order.consts");
const order_model_1 = require("./order.model");
const order_counter_model_1 = require("./order.counter.model");
const getAllOrdersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const orderQuery = new QueryBuilder_1.default(order_model_1.OrderModel.find(), query)
        .search(order_consts_1.OrderSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield orderQuery.modelQuery.populate({
        path: "orderInfo.productInfo",
        select: "description.name productInfo.price productInfo.salePrice featuredImg",
    });
    const meta = yield orderQuery.countTotal();
    return {
        meta,
        data,
    };
});
const recentlyOrderedProductsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const recentOrders = yield order_model_1.OrderModel.aggregate([
        { $unwind: "$orderInfo" },
        { $sort: { "orderInfo.orderDate": -1 } },
        {
            $group: {
                _id: "$orderInfo.productInfo",
                lastOrderedDate: { $first: "$orderInfo.orderDate" },
            },
        },
        { $sort: { lastOrderedDate: -1 } },
        { $limit: 12 },
    ]);
    const productIds = recentOrders.map((order) => order._id);
    if (!productIds.length)
        return [];
    const products = yield product_model_1.ProductModel.find({ _id: { $in: productIds } })
        .populate({
        path: "categoryAndTags.categories",
        select: "mainCategory name slug details icon image bannerImg subCategories",
    })
        .populate({
        path: "categoryAndTags.tags",
        select: "name slug details icon image",
    })
        .populate({
        path: "productInfo.brand",
        select: "name logo slug",
    })
        .populate({
        path: "bookInfo.specification.authors",
        select: "name image description",
    })
        .lean()
        .exec();
    const sortedProducts = productIds.map((id) => products.find((p) => p._id.toString() === id.toString()));
    return sortedProducts.filter(Boolean);
});
const getMyOrdersFromDB = (customerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const orderQuery = new QueryBuilder_1.default(order_model_1.OrderModel.find({ "orderInfo.orderBy": customerId }), query)
        .search(order_consts_1.OrderSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield orderQuery.modelQuery.populate({
        path: "orderInfo.productInfo",
        select: "description.name productInfo.price productInfo.salePrice featuredImg",
    });
    const meta = yield orderQuery.countTotal();
    return { data, meta };
});
const getOrderByTrackingNumberFromDB = (trackingNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_model_1.OrderModel.findOne({
        "orderInfo.trackingNumber": trackingNumber,
    })
        .populate({
        path: "orderInfo.productInfo",
        select: "description.name productInfo.price productInfo.salePrice featuredImg",
    })
        .lean();
    if (!result) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order not found with this tracking number!");
    }
    const matchedOrderInfo = result.orderInfo.find((info) => info.trackingNumber === trackingNumber);
    if (!matchedOrderInfo) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Tracking number not found in this order!");
    }
    return {
        _id: result._id,
        orderInfo: [matchedOrderInfo],
        customerInfo: result.customerInfo,
        paymentInfo: result.paymentInfo,
        totalAmount: result.totalAmount,
        createdAt: result.createdAt,
    };
});
const getOrderSummaryFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.OrderModel.find();
    let totalOrders = orders.length;
    let totalPendingOrders = 0;
    let totalCompletedOrders = 0;
    let totalPendingAmount = 0;
    let totalCompletedAmount = 0;
    orders.forEach((order) => {
        if (Array.isArray(order.orderInfo) && order.orderInfo.length > 0) {
            const status = order.orderInfo[0].status;
            const total = order.totalAmount || 0;
            if (status === "pending") {
                totalPendingOrders++;
                totalPendingAmount += total;
            }
            else if (status === "completed") {
                totalCompletedOrders++;
                totalCompletedAmount += total;
            }
        }
    });
    return {
        totalOrders,
        totalPendingOrders,
        totalCompletedOrders,
        totalPendingAmount,
        totalCompletedAmount,
    };
});
const getOrderRangeSummaryFromDB = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid date format!");
    }
    const orders = yield order_model_1.OrderModel.find({
        createdAt: { $gte: start, $lte: end },
    }).lean();
    let totalOrders = orders.length;
    let totalPendingOrders = 0;
    let totalCompletedOrders = 0;
    let totalPendingAmount = 0;
    let totalCompletedAmount = 0;
    orders.forEach((order) => {
        if (Array.isArray(order.orderInfo) && order.orderInfo.length > 0) {
            const status = order.orderInfo[0].status;
            const total = order.totalAmount || 0;
            if (status === "pending") {
                totalPendingOrders++;
                totalPendingAmount += total;
            }
            else if (status === "completed") {
                totalCompletedOrders++;
                totalCompletedAmount += total;
            }
        }
    });
    return {
        totalOrders,
        totalPendingOrders,
        totalCompletedOrders,
        totalPendingAmount: Number(totalPendingAmount.toFixed(2)),
        totalCompletedAmount: Number(totalCompletedAmount.toFixed(2)),
        dateRange: {
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
        },
    };
});
const getSingleOrderFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_model_1.OrderModel.findById(id).populate({
        path: "orderInfo.productInfo",
        select: "description.name productInfo.price productInfo.salePrice featuredImg",
    });
    if (!result) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order does not exists!");
    }
    return result;
});
const generateOrderId = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateKey = `${year}${month}${day}`;
    const counter = yield order_counter_model_1.OrderCounterModel.findOneAndUpdate({ date: dateKey }, { $inc: { count: 1 } }, { upsert: true, new: true });
    const serialNumber = String(counter.count).padStart(4, '0');
    return `${dateKey}-${serialNumber}`;
});
const generateTrackingNumber = () => {
    return Math.floor(Math.random() * 900000000) + 100000000;
};
const createOrderIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.orderId = yield generateOrderId();
    const result = yield order_model_1.OrderModel.create(payload);
    return result;
});
const updateOrderInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield order_model_1.OrderModel.findById(id);
    if (!isExist) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order does not exists!");
    }
    const result = yield order_model_1.OrderModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: false
    });
    return result;
});
const changeOrderStatusInDB = (orderId, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const validStatuses = [
        "pending",
        "processing",
        "at-local-facility",
        "out-for-delivery",
        "cancelled",
        "completed",
    ];
    if (!validStatuses.includes(newStatus)) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid status value!");
    }
    const result = yield order_model_1.OrderModel.findByIdAndUpdate(orderId, {
        $set: {
            "orderInfo.$[].status": newStatus,
        },
    }, { new: true, runValidators: true }).lean();
    if (!result) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order not found!");
    }
    return result;
});
exports.orderServices = {
    getAllOrdersFromDB,
    getSingleOrderFromDB,
    createOrderIntoDB,
    updateOrderInDB,
    getOrderSummaryFromDB,
    getOrderByTrackingNumberFromDB,
    recentlyOrderedProductsFromDB,
    getMyOrdersFromDB,
    getOrderRangeSummaryFromDB,
    changeOrderStatusInDB,
};
