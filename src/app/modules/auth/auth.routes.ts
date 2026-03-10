import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidations } from "./auth.validations";
import auth from "../../middlewares/auth";

const router = express.Router();

// Individual routes

router.post(
  "/register",
  validateRequest(AuthValidations.registerUser),
  AuthController.registerUser
);

router.post(
  "/login",
  validateRequest(AuthValidations.loginUser),
  AuthController.loginUser
);

router.post("/logout/:id", AuthController.logOutUser);

router.post(
  "/login/provider",
  validateRequest(AuthValidations.loginUserUsingProvider),
  AuthController.loginUserUsingProvider
);

// Refresh access token using refresh token
router.post("/refresh-token", AuthController.refreshToken);

// Change password
router.post(
  "/change-password",
  validateRequest(AuthValidations.changePassword),
  AuthController.changePassword
);

// Forgot password
router.post(
  "/forgot-password",
  validateRequest(AuthValidations.forgotPassword),
  AuthController.forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  validateRequest(AuthValidations.resetPassword),
  AuthController.resetPassword
);

// Get current user
router.get("/me", auth("customer", "admin", "super-admin", "admin-staff", "vendor", "vendor-staff"), AuthController.getMe);

export const AuthRoutes = router;
