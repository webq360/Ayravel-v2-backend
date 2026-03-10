import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as pathaoService from "./pathao.service";

// 🔹 Issue Token
export const issueTokenController = catchAsync(async (req, res) => {
  const result = await pathaoService.issueToken();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pathao token issued successfully",
    data: result,
  });
});

// 🔹 Create Store
export const createStoreController = catchAsync(async (req, res) => {
  const result = await pathaoService.createStore(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Pathao store created successfully",
    data: result,
  });
});

// 🔹 Get Stores
export const getStoresController = catchAsync(async (req, res) => {
  const result = await pathaoService.getStores();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pathao stores retrieved successfully",
    data: result,
  });
});

// 🔹 Get Cities
export const getCitiesController = catchAsync(async (req, res) => {
  const result = await pathaoService.getCities();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pathao cities retrieved successfully",
    data: result,
  });
});

// 🔹 Get Zones by City
export const getZonesByCityController = catchAsync(async (req, res) => {
  const result = await pathaoService.getZonesByCity(req.params.cityId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pathao zones retrieved successfully",
    data: result,
  });
});

// 🔹 Get Areas by Zone
export const getAreasByZoneController = catchAsync(async (req, res) => {
  const result = await pathaoService.getAreasByZone(req.params.zoneId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pathao areas retrieved successfully",
    data: result,
  });
});

// 🔹 Create Order
export const createOrderController = catchAsync(async (req, res) => {
  const result = await pathaoService.createOrder(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Pathao order created successfully",
    data: result,
  });
});

// 🔹 Get Order Info
export const getOrderInfoController = catchAsync(async (req, res) => {
  const result = await pathaoService.getOrderInfo(req.params.consignmentId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pathao order info retrieved successfully",
    data: result,
  });
});
