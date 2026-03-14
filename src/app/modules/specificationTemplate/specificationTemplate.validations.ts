import { z } from "zod";

const specificationOptionSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  label: z.string().min(1, "Option label is required"),
  colorCode: z.string().optional(),
  image: z.string().optional(),
});

const specificationFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["select", "color", "text", "number"]),
  required: z.boolean().default(false),
  options: z.array(specificationOptionSchema).default([]),
});

const createSpecificationTemplateSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, "Category ID is required"),
    categoryName: z.string().min(1, "Category name is required"),
    fields: z.array(specificationFieldSchema).min(1, "At least one field is required"),
    isActive: z.boolean().default(true),
  }),
});

const updateSpecificationTemplateSchema = z.object({
  body: z.object({
    categoryName: z.string().optional(),
    fields: z.array(specificationFieldSchema).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const specificationTemplateValidations = {
  createSpecificationTemplateSchema,
  updateSpecificationTemplateSchema,
};