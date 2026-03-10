import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ContactServices } from "./contact.service";

const sendContactMessage = catchAsync(async (req, res) => {
  const result = await ContactServices.sendContactMessageToDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message sent successfully!",
    data: result,
  });
});

export const ContactController = {
  sendContactMessage,
};
