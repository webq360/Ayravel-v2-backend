import config from "../../config";
import { sendEmail } from "../../utils/sendEmail";
import { TContact } from "./contact.interface";

const sendContactMessageToDB = async (payload: TContact) => {
  const { name, email, phone, subject, message } = payload;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
        New Contact Form Submission from Elizabeth BD
      </h2>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
        ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ""}
        <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
      </div>
      
      <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Message:</h3>
        <p style="color: #555; line-height: 1.6;">${message}</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
        <p>This email was sent from the contact form on Elizabeth BD website.</p>
      </div>
    </div>
  `;

  await sendEmail(
    config.email_user as string,
    `Contact Form: ${subject}`,
    html
  );

  return { message: "Message sent successfully!" };
};

export const ContactServices = {
  sendContactMessageToDB,
};
