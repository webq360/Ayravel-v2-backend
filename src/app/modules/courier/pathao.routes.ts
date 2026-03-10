import express from "express";
import {
  createOrderController,
  createStoreController,
  getAreasByZoneController,
  getCitiesController,
  getStoresController,
  getZonesByCityController,
  issueTokenController,
  getOrderInfoController,
} from "./pathao.controller";

const router = express.Router();

router.post("/issue-token", issueTokenController);
router.post("/create-store", createStoreController);
router.post("/create-order", createOrderController);
router.get("/stores", getStoresController);
router.get("/cities", getCitiesController);
router.get("/cities/:cityId/zones", getZonesByCityController);
router.get("/zones/:zoneId/areas", getAreasByZoneController);
router.get("/orders/:consignmentId/info", getOrderInfoController);

export const pathaoRoutes = router;
