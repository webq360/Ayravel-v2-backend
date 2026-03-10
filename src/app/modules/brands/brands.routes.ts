import express from "express";
import { multerMemory } from "../../config/multer.config";
import { brandsControllers } from "./brands.controller";

const router = express.Router();

router.get("/", brandsControllers.getAllBrands);
router.get("/:id", brandsControllers.getSingleBrand);

router.post(
  "/create-brand",
  multerMemory.fields([
    { name: "iconFile", maxCount: 1 },
    { name: "imagesFiles", maxCount: 10 },
  ]),
  brandsControllers.createBrand
);

router.patch(
  "/update-brand/:id",
  multerMemory.fields([
    { name: "iconFile", maxCount: 1 },
    { name: "imagesFiles", maxCount: 10 },
  ]),
  brandsControllers.updateBrand
);

router.delete("/delete-brand/:id", brandsControllers.deleteBrand);

export const BrandRoutes = router;
