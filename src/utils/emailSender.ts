import nodemailer from "nodemailer";
import config from "../config/index";

// Create reusable transporter object only if credentials exist
const createTransporter = () => {
  if (!config.emailUser || !config.emailPass) {
    console.error("❌ Email Configuration Error: EMAIL_USER or EMAIL_PASS is missing in .env file");
    console.error("   EMAIL_USER:", config.emailUser ? "✓ Set" : "✗ Missing");
    console.error("   EMAIL_PASS:", config.emailPass ? "✓ Set" : "✗ Missing");
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });

    // Verify the transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email Transporter Verification Failed:");
        console.error("   Error:", error.message);
        console.error("   Possible Causes:");
        console.error("   1. EMAIL_PASS should be a Gmail 'App Password', not your regular password");
        console.error("   2. Two-Factor Authentication might be enabled on the Gmail account");
        console.error("   3. Gmail account might have blocked less secure app access");
        console.error("   4. Check if the email address is correct: " + config.emailUser);
      } else {
        console.log("✓ Email Transporter Verified Successfully");
        console.log("  Email Account: " + config.emailUser);
      }
    });

    return transporter;
  } catch (error) {
    console.error("❌ Error Creating Email Transporter:", error);
    return null;
  }
};

const transporter = createTransporter();

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  retryCount = 0,
): Promise<any> => {
  if (!transporter) {
    console.error(
      "❌ Email Send Failed: Transporter is not initialized. Check EMAIL_USER and EMAIL_PASS in .env",
    );
    return null;
  }

  const mailOptions = {
    from: config.emailUser,
    to,
    subject,
    html,
  };

  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`   Subject: ${subject}`);

    const info = await transporter.sendMail(mailOptions);

    console.log("✓ Email Sent Successfully");
    console.log(`   Response: ${info.response}`);
    console.log(`   Message ID: ${info.messageId}`);

    return info;
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";

    console.error("❌ Error Sending Email:");
    console.error(`   To: ${to}`);
    console.error(`   Subject: ${subject}`);
    console.error(`   Error: ${errorMessage}`);

    // Provide helpful debugging information
    if (
      errorMessage.includes("Invalid login") ||
      errorMessage.includes("invalid user")
    ) {
      console.error("   💡 Fix: Check EMAIL_USER in .env file");
    } else if (
      errorMessage.includes("invalid password") ||
      errorMessage.includes("unauthorized")
    ) {
      console.error("   💡 Fix: EMAIL_PASS should be Gmail 'App Password', not your regular password");
      console.error("   📝 How to create App Password:");
      console.error("      1. Go to https://myaccount.google.com/apppasswords");
      console.error("      2. Select 'Mail' and 'Windows Computer'");
      console.error("      3. Generate and copy the password");
      console.error("      4. Update EMAIL_PASS in .env");
    } else if (errorMessage.includes("timeout")) {
      console.error("   💡 Fix: Network timeout. Check your internet connection");

      // Retry logic for timeout errors
      if (retryCount < 2) {
        console.log(`   🔄 Retrying... (Attempt ${retryCount + 1} of 3)`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return sendEmail(to, subject, html, retryCount + 1);
      }
    } else if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("ECONNREFUSED")) {
      console.error("   💡 Fix: Cannot connect to Gmail servers. Check internet connection");
    }

    // Return null but don't throw - prevent breaking the order creation flow
    return null;
  }
};

/**
 * Test email sending functionality
 * Use this function to verify email configuration
 */
export const testEmailConnection = async (testEmail: string): Promise<boolean> => {
  try {
    console.log("\n🧪 Testing Email Connection...");
    console.log(`   From: ${config.emailUser}`);
    console.log(`   To: ${testEmail}`);

    const result = await sendEmail(
      testEmail,
      "🧪 MediStore Email Test",
      `
        <h1>Email Configuration Test</h1>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>You can now proceed with order confirmations.</p>
      `,
    );

    if (result) {
      console.log("✓ Email Test Passed!");
      return true;
    } else {
      console.log("✗ Email Test Failed");
      return false;
    }
  } catch (error) {
    console.error("✗ Email Test Error:", error);
    return false;
  }
};
