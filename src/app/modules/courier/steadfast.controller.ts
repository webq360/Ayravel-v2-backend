import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as steadfastService from "./steadfast.service";

// 🔹 Create Single Order
export const createOrderController = catchAsync(async (req, res) => {
  const result = await steadfastService.createOrder(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Steadfast order created successfully!",
    data: result,
  });
});

// 🔹 Bulk Order
export const bulkCreateOrderController = catchAsync(async (req, res) => {
  const result = await steadfastService.bulkCreateOrders(req.body.data);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Steadfast bulk orders created successfully!",
    data: result,
  });
});

// 🔹 Status by Invoice / Consignment / Tracking
export const getStatusByInvoiceController = catchAsync(async (req, res) => {
  const result = await steadfastService.getStatusByInvoice(req.params.invoice);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Delivery status by invoice retrieved successfully",
    data: result,
  });
});

export const getStatusByConsignmentIdController = catchAsync(
  async (req, res) => {
    const result = await steadfastService.getStatusByConsignmentId(
      req.params.id
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Delivery status by consignment ID retrieved successfully",
      data: result,
    });
  }
);

export const getStatusByTrackingCodeController = catchAsync(
  async (req, res) => {
    const result = await steadfastService.getStatusByTrackingCode(
      req.params.trackingCode
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Delivery status by tracking code retrieved successfully",
      data: result,
    });
  }
);

// 🔹 Get Current Balance
export const getCurrentBalanceController = catchAsync(async (req, res) => {
  const result = await steadfastService.getCurrentBalance();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Current balance retrieved successfully",
    data: result,
  });
});

// 🔹 Return Request
export const createReturnRequestController = catchAsync(async (req, res) => {
  const result = await steadfastService.createReturnRequest(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Return request created successfully",
    data: result,
  });
});

export const getReturnRequestController = catchAsync(async (req, res) => {
  const result = await steadfastService.getReturnRequest(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Single return request fetched successfully",
    data: result,
  });
});

export const getReturnRequestsController = catchAsync(async (req, res) => {
  const result = await steadfastService.getReturnRequests();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All return requests fetched successfully",
    data: result,
  });
});

// 🔹 Get Payments
export const getPaymentsController = catchAsync(async (req, res) => {
  const result = await steadfastService.getPayments();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments fetched successfully",
    data: result,
  });
});

// 🔹 Get Single Payment with Consignments
export const getPaymentByIdController = catchAsync(async (req, res) => {
  const result = await steadfastService.getPaymentById(req.params.paymentId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details fetched successfully",
    data: result,
  });
});

// 🔹 Get Police Stations
export const getPoliceStationsController = catchAsync(async (req, res) => {
  const result = await steadfastService.getPoliceStations();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Police stations fetched successfully",
    data: result,
  });
});
