"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactValidations = void 0;
const zod_1 = require("zod");
const sendContactMessage = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().optional(),
    subject: zod_1.z.string().min(1, "Subject is required"),
    message: zod_1.z.string().min(1, "Message is required"),
});
exports.ContactValidations = {
    sendContactMessage,
};
