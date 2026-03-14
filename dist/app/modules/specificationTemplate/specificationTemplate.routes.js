"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specificationTemplateRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const specificationTemplate_controller_1 = require("./specificationTemplate.controller");
const specificationTemplate_validations_1 = require("./specificationTemplate.validations");
const router = (0, express_1.Router)();
router.post("/create", (0, validateRequest_1.default)(specificationTemplate_validations_1.specificationTemplateValidations.createSpecificationTemplateSchema), specificationTemplate_controller_1.specificationTemplateControllers.createSpecificationTemplate);
router.get("/", specificationTemplate_controller_1.specificationTemplateControllers.getAllSpecificationTemplates);
router.get("/category/:categoryId", specificationTemplate_controller_1.specificationTemplateControllers.getSpecificationTemplateByCategory);
router.patch("/:id", (0, validateRequest_1.default)(specificationTemplate_validations_1.specificationTemplateValidations.updateSpecificationTemplateSchema), specificationTemplate_controller_1.specificationTemplateControllers.updateSpecificationTemplate);
router.delete("/:id", specificationTemplate_controller_1.specificationTemplateControllers.deleteSpecificationTemplate);
exports.specificationTemplateRoutes = router;
