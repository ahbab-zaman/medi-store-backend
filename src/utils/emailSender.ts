import nodemailer from "nodemailer";
import config from "../config/index";

// Create reusable transporter object only if credentials exist
const createTransporter = () => {
  if (!config.emailUser || !config.emailPass) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });
};

const transporter = createTransporter();

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.warn("Email credentials missing. Skipping email send.");
    return null;
  }

  const mailOptions = {
    from: config.emailUser,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    // Log error but don't throw to prevent breaking the flow (e.g. order creation)
    console.error("Error sending email:", error);
    return null;
  }
};
