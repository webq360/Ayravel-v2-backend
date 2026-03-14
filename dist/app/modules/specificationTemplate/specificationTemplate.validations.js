"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specificationTemplateValidations = void 0;
const zod_1 = require("zod");
const specificationOptionSchema = zod_1.z.object({
    value: zod_1.z.string().min(1, "Option value is required"),
    label: zod_1.z.string().min(1, "Option label is required"),
    colorCode: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
const specificationFieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Field name is required"),
    label: zod_1.z.string().min(1, "Field label is required"),
    type: zod_1.z.enum(["select", "color", "text", "number"]),
    required: zod_1.z.boolean().default(false),
    options: zod_1.z.array(specificationOptionSchema).default([]),
});
const createSpecificationTemplateSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().min(1, "Category ID is required"),
        categoryName: zod_1.z.string().min(1, "Category name is required"),
        fields: zod_1.z.array(specificationFieldSchema).min(1, "At least one field is required"),
        isActive: zod_1.z.boolean().default(true),
    }),
});
const updateSpecificationTemplateSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string().optional(),
        fields: zod_1.z.array(specificationFieldSchema).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.specificationTemplateValidations = {
    createSpecificationTemplateSchema,
    updateSpecificationTemplateSchema,
};
