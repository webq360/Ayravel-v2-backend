"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificationTemplateModel = void 0;
const mongoose_1 = require("mongoose");
const specificationOptionSchema = new mongoose_1.Schema({
    value: { type: String, required: true },
    label: { type: String, required: true },
    colorCode: String,
    image: String
}, { _id: false });
const specificationFieldSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["select", "color", "text", "number"], required: true },
    required: { type: Boolean, default: false },
    options: [specificationOptionSchema]
}, { _id: false });
const specificationTemplateSchema = new mongoose_1.Schema({
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "category", required: true },
    categoryName: { type: String, required: true },
    fields: [specificationFieldSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.SpecificationTemplateModel = (0, mongoose_1.model)("SpecificationTemplate", specificationTemplateSchema);
