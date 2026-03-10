"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_validations_1 = require("./auth.validations");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// Individual routes
router.post("/register", (0, validateRequest_1.default)(auth_validations_1.AuthValidations.registerUser), auth_controller_1.AuthController.registerUser);
router.post("/login", (0, validateRequest_1.default)(auth_validations_1.AuthValidations.loginUser), auth_controller_1.AuthController.loginUser);
router.post("/logout/:id", auth_controller_1.AuthController.logOutUser);
router.post("/login/provider", (0, validateRequest_1.default)(auth_validations_1.AuthValidations.loginUserUsingProvider), auth_controller_1.AuthController.loginUserUsingProvider);
// Refresh access token using refresh token
router.post("/refresh-token", auth_controller_1.AuthController.refreshToken);
// Change password
router.post("/change-password", (0, validateRequest_1.default)(auth_validations_1.AuthValidations.changePassword), auth_controller_1.AuthController.changePassword);
// Forgot password
router.post("/forgot-password", (0, validateRequest_1.default)(auth_validations_1.AuthValidations.forgotPassword), auth_controller_1.AuthController.forgotPassword);
// Reset password
router.post("/reset-password", (0, validateRequest_1.default)(auth_validations_1.AuthValidations.resetPassword), auth_controller_1.AuthController.resetPassword);
// Get current user
router.get("/me", (0, auth_1.default)("customer", "admin", "super-admin", "admin-staff", "vendor", "vendor-staff"), auth_controller_1.AuthController.getMe);
exports.AuthRoutes = router;
