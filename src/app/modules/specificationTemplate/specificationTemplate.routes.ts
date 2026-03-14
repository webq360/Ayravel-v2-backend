import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { specificationTemplateControllers } from "./specificationTemplate.controller";
import { specificationTemplateValidations } from "./specificationTemplate.validations";

const router = Router();

router.post(
  "/create",
  validateRequest(specificationTemplateValidations.createSpecificationTemplateSchema),
  specificationTemplateControllers.createSpecificationTemplate
);

router.get(
  "/",
  specificationTemplateControllers.getAllSpecificationTemplates
);

router.get(
  "/category/:categoryId",
  specificationTemplateControllers.getSpecificationTemplateByCategory
);

router.patch(
  "/:id",
  validateRequest(specificationTemplateValidations.updateSpecificationTemplateSchema),
  specificationTemplateControllers.updateSpecificationTemplate
);

router.delete(
  "/:id",
  specificationTemplateControllers.deleteSpecificationTemplate
);

export const specificationTemplateRoutes = router;