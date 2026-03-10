"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const contact_controller_1 = require("./contact.controller");
const contact_validations_1 = require("./contact.validations");
const router = express_1.default.Router();
router.post("/send-message", (0, validateRequest_1.default)(contact_validations_1.ContactValidations.sendContactMessage), contact_controller_1.ContactController.sendContactMessage);
exports.ContactRoutes = router;
