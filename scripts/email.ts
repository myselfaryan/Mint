import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env and .env.local
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

import { prompt } from "enquirer";
import { sendEmail } from "../lib/email";

async function main() {
  try {
    const response = await prompt<{
      to: string;
      subject: string;
      message: string;
    }>([
      {
        type: "input",
        name: "to",
        message: "Enter recipient email:",
        validate: (value) =>
          value.includes("@") || "Please enter a valid email",
      },
      {
        type: "input",
        name: "subject",
        message: "Enter email subject:",
        validate: (value) => !!value || "Subject cannot be empty",
      },
      {
        type: "input",
        name: "message",
        message: "Enter email message:",
        validate: (value) => !!value || "Message cannot be empty",
      },
    ]);

    console.log("\nSending email...");
    await sendEmail({
      to: response.to,
      subject: response.subject,
      html: response.message,
    });

    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    process.exit(1);
  }
}

main();
