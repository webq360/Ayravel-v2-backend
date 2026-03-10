import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/handleAppError";
import { ProductModel } from "../product/product.model";
import { OrderSearchableFields } from "./order.consts";
import { TOrder } from "./order.interface";
import { OrderModel } from "./order.model";
import { OrderCounterModel } from "./order.counter.model";

const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(OrderModel.find(), query)
    .search(OrderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await orderQuery.modelQuery.populate({
    path: "orderInfo.productInfo",
    select: "description.name productInfo.price productInfo.salePrice featuredImg",
  });

  const meta = await orderQuery.countTotal();

  return {
    meta,
    data,
  };
};

const recentlyOrderedProductsFromDB = async () => {
  const recentOrders = await OrderModel.aggregate([
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

  if (!productIds.length) return [];

  const products = await ProductModel.find({ _id: { $in: productIds } })
    .populate({
      path: "categoryAndTags.categories",
      select:
        "mainCategory name slug details icon image bannerImg subCategories",
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

  const sortedProducts = productIds.map((id) =>
    products.find((p) => p._id.toString() === id.toString())
  );

  return sortedProducts.filter(Boolean);
};

const getMyOrdersFromDB = async (
  customerId: string,
  query: Record<string, unknown>
) => {
  const orderQuery = new QueryBuilder(
    OrderModel.find({ "orderInfo.orderBy": customerId }),
    query
  )
    .search(OrderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await orderQuery.modelQuery.populate({
    path: "orderInfo.productInfo",
    select: "description.name productInfo.price productInfo.salePrice featuredImg",
  });

  const meta = await orderQuery.countTotal();

  return { data, meta };
};

const getOrderByTrackingNumberFromDB = async (trackingNumber: number) => {
  const result = await OrderModel.findOne({
    "orderInfo.trackingNumber": trackingNumber,
  })
    .populate({
      path: "orderInfo.productInfo",
      select:
        "description.name productInfo.price productInfo.salePrice featuredImg",
    })
    .lean();

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Order not found with this tracking number!"
    );
  }

  const matchedOrderInfo = result.orderInfo.find(
    (info) => info.trackingNumber === trackingNumber
  );

  if (!matchedOrderInfo) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Tracking number not found in this order!"
    );
  }

  return {
    _id: result._id,
    orderInfo: [matchedOrderInfo],
    customerInfo: result.customerInfo,
    paymentInfo: result.paymentInfo,
    totalAmount: result.totalAmount,
    createdAt: result.createdAt,
  };
};

const getOrderSummaryFromDB = async () => {
  const orders = await OrderModel.find();

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
      } else if (status === "completed") {
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
};

const getOrderRangeSummaryFromDB = async (
  startDate: string,
  endDate: string
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid date format!");
  }

  const orders = await OrderModel.find({
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
      } else if (status === "completed") {
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
};

const getSingleOrderFromDB = async (id: string) => {
  const result = await OrderModel.findById(id).populate({
    path: "orderInfo.productInfo",
    select: "description.name productInfo.price productInfo.salePrice featuredImg",
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Order does not exists!");
  }

  return result;
};

const generateOrderId = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateKey = `${year}${month}${day}`;

  const counter = await OrderCounterModel.findOneAndUpdate(
    { date: dateKey },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  const serialNumber = String(counter.count).padStart(4, '0');
  return `${dateKey}-${serialNumber}`;
};

const generateTrackingNumber = (): number => {
  return Math.floor(Math.random() * 900000000) + 100000000;
};

const createOrderIntoDB = async (payload: TOrder) => {
  payload.orderId = await generateOrderId();
  const result = await OrderModel.create(payload);
  return result;
};

const updateOrderInDB = async (id: string, payload: Partial<TOrder>) => {
  const isExist = await OrderModel.findById(id);

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Order does not exists!");
  }

  const result = await OrderModel.findByIdAndUpdate(id, payload, { 
    new: true, 
    runValidators: false 
  });
  return result;
};

const changeOrderStatusInDB = async (orderId: string, newStatus: string) => {
  const validStatuses = [
    "pending",
    "processing",
    "at-local-facility",
    "out-for-delivery",
    "cancelled",
    "completed",
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value!");
  }

  const result = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        "orderInfo.$[].status": newStatus,
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  return result;
};

export const orderServices = {
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