"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathaoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const pathao_controller_1 = require("./pathao.controller");
const router = express_1.default.Router();
router.post("/issue-token", pathao_controller_1.issueTokenController);
router.post("/create-store", pathao_controller_1.createStoreController);
router.post("/create-order", pathao_controller_1.createOrderController);
router.get("/stores", pathao_controller_1.getStoresController);
router.get("/cities", pathao_controller_1.getCitiesController);
router.get("/cities/:cityId/zones", pathao_controller_1.getZonesByCityController);
router.get("/zones/:zoneId/areas", pathao_controller_1.getAreasByZoneController);
router.get("/orders/:consignmentId/info", pathao_controller_1.getOrderInfoController);
exports.pathaoRoutes = router;
