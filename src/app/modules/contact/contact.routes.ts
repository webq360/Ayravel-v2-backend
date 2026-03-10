import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ContactController } from "./contact.controller";
import { ContactValidations } from "./contact.validations";

const router = express.Router();

router.post(
  "/send-message",
  validateRequest(ContactValidations.sendContactMessage),
  ContactController.sendContactMessage
);

export const ContactRoutes = router;
