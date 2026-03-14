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
exports.specificationTemplateControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const specificationTemplate_service_1 = require("./specificationTemplate.service");
const createSpecificationTemplate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield specificationTemplate_service_1.specificationTemplateServices.createSpecificationTemplateOnDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Specification template created successfully",
        data: result,
    });
}));
const getAllSpecificationTemplates = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield specificationTemplate_service_1.specificationTemplateServices.getAllSpecificationTemplatesFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Specification templates retrieved successfully",
        data: result,
    });
}));
const getSpecificationTemplateByCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    const result = yield specificationTemplate_service_1.specificationTemplateServices.getSpecificationTemplateByCategoryFromDB(categoryId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Specification template retrieved successfully",
        data: result,
    });
}));
const updateSpecificationTemplate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield specificationTemplate_service_1.specificationTemplateServices.updateSpecificationTemplateOnDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Specification template updated successfully",
        data: result,
    });
}));
const deleteSpecificationTemplate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield specificationTemplate_service_1.specificationTemplateServices.deleteSpecificationTemplateFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: null,
    });
}));
exports.specificationTemplateControllers = {
    createSpecificationTemplate,
    getAllSpecificationTemplates,
    getSpecificationTemplateByCategory,
    updateSpecificationTemplate,
    deleteSpecificationTemplate,
};
