import { model, Schema } from "mongoose";
import { TSpecificationTemplate, TSpecificationField, TSpecificationOption } from "./specificationTemplate.interface";

const specificationOptionSchema = new Schema<TSpecificationOption>({
  value: { type: String, required: true },
  label: { type: String, required: true },
  colorCode: String,
  image: String
}, { _id: false });

const specificationFieldSchema = new Schema<TSpecificationField>({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ["select", "color", "text", "number"], required: true },
  required: { type: Boolean, default: false },
  options: [specificationOptionSchema]
}, { _id: false });

const specificationTemplateSchema = new Schema<TSpecificationTemplate>({
  categoryId: { type: Schema.Types.ObjectId, ref: "category", required: true },
  categoryName: { type: String, required: true },
  fields: [specificationFieldSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const SpecificationTemplateModel = model<TSpecificationTemplate>("SpecificationTemplate", specificationTemplateSchema);