import AppError from "../../errors/handleAppError";
import { TSpecificationTemplate } from "./specificationTemplate.interface";
import { SpecificationTemplateModel } from "./specificationTemplate.model";

const createSpecificationTemplateOnDB = async (payload: TSpecificationTemplate) => {
  const existingTemplate = await SpecificationTemplateModel.findOne({
    categoryId: payload.categoryId,
    isActive: true
  });

  if (existingTemplate) {
    throw new AppError(400, "Specification template already exists for this category");
  }

  const result = await SpecificationTemplateModel.create(payload);
  return result;
};

const getAllSpecificationTemplatesFromDB = async () => {
  return await SpecificationTemplateModel.find({ isActive: true })
    .populate("categoryId")
    .sort({ createdAt: -1 });
};

const getSpecificationTemplateByCategoryFromDB = async (categoryId: string) => {
  return await SpecificationTemplateModel.findOne({
    categoryId,
    isActive: true
  }).populate("categoryId");
};

const updateSpecificationTemplateOnDB = async (id: string, payload: Partial<TSpecificationTemplate>) => {
  const template = await SpecificationTemplateModel.findById(id);
  if (!template) {
    throw new AppError(404, "Specification template not found");
  }

  const result = await SpecificationTemplateModel.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  ).populate("categoryId");

  return result;
};

const deleteSpecificationTemplateFromDB = async (id: string) => {
  const template = await SpecificationTemplateModel.findById(id);
  if (!template) {
    throw new AppError(404, "Specification template not found");
  }

  await SpecificationTemplateModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  return { message: "Specification template deleted successfully" };
};

export const specificationTemplateServices = {
  createSpecificationTemplateOnDB,
  getAllSpecificationTemplatesFromDB,
  getSpecificationTemplateByCategoryFromDB,
  updateSpecificationTemplateOnDB,
  deleteSpecificationTemplateFromDB,
};