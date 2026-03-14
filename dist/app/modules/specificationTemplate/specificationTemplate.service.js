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
exports.specificationTemplateServices = void 0;
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const specificationTemplate_model_1 = require("./specificationTemplate.model");
const createSpecificationTemplateOnDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTemplate = yield specificationTemplate_model_1.SpecificationTemplateModel.findOne({
        categoryId: payload.categoryId,
        isActive: true
    });
    if (existingTemplate) {
        throw new handleAppError_1.default(400, "Specification template already exists for this category");
    }
    const result = yield specificationTemplate_model_1.SpecificationTemplateModel.create(payload);
    return result;
});
const getAllSpecificationTemplatesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield specificationTemplate_model_1.SpecificationTemplateModel.find({ isActive: true })
        .populate("categoryId")
        .sort({ createdAt: -1 });
});
const getSpecificationTemplateByCategoryFromDB = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield specificationTemplate_model_1.SpecificationTemplateModel.findOne({
        categoryId,
        isActive: true
    }).populate("categoryId");
});
const updateSpecificationTemplateOnDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield specificationTemplate_model_1.SpecificationTemplateModel.findById(id);
    if (!template) {
        throw new handleAppError_1.default(404, "Specification template not found");
    }
    const result = yield specificationTemplate_model_1.SpecificationTemplateModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).populate("categoryId");
    return result;
});
const deleteSpecificationTemplateFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield specificationTemplate_model_1.SpecificationTemplateModel.findById(id);
    if (!template) {
        throw new handleAppError_1.default(404, "Specification template not found");
    }
    yield specificationTemplate_model_1.SpecificationTemplateModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return { message: "Specification template deleted successfully" };
});
exports.specificationTemplateServices = {
    createSpecificationTemplateOnDB,
    getAllSpecificationTemplatesFromDB,
    getSpecificationTemplateByCategoryFromDB,
    updateSpecificationTemplateOnDB,
    deleteSpecificationTemplateFromDB,
};
