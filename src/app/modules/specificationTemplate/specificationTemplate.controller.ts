import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { specificationTemplateServices } from "./specificationTemplate.service";

const createSpecificationTemplate = catchAsync(async (req: Request, res: Response) => {
  const result = await specificationTemplateServices.createSpecificationTemplateOnDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Specification template created successfully",
    data: result,
  });
});

const getAllSpecificationTemplates = catchAsync(async (req: Request, res: Response) => {
  const result = await specificationTemplateServices.getAllSpecificationTemplatesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specification templates retrieved successfully",
    data: result,
  });
});

const getSpecificationTemplateByCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const result = await specificationTemplateServices.getSpecificationTemplateByCategoryFromDB(categoryId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specification template retrieved successfully",
    data: result,
  });
});

const updateSpecificationTemplate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specificationTemplateServices.updateSpecificationTemplateOnDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specification template updated successfully",
    data: result,
  });
});

const deleteSpecificationTemplate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specificationTemplateServices.deleteSpecificationTemplateFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const specificationTemplateControllers = {
  createSpecificationTemplate,
  getAllSpecificationTemplates,
  getSpecificationTemplateByCategory,
  updateSpecificationTemplate,
  deleteSpecificationTemplate,
};