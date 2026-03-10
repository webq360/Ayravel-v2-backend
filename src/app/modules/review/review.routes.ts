import express from "express";
import { multerUpload } from "../../config/multer.config";
import { reviewControllers } from "./review.controller";

const router = express.Router();

const uploadFields = multerUpload.fields([{ name: "photos", maxCount: 5 }]);

router.get("/product/:productId", reviewControllers.getApprovedReviewsByProduct);
router.get("/", reviewControllers.getAllReviews);
router.get("/:id", reviewControllers.getSingleReview);
router.post("/", uploadFields, reviewControllers.createReview);
router.patch("/:id", uploadFields, reviewControllers.updateReview);
router.delete("/:id", reviewControllers.deleteReview);

export const reviewRoutes = router;
