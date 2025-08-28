import { Resend } from "resend";

import type { AppContext } from "../types";

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(
  c: AppContext,
  { to, subject, html }: SendMailParams,
) {
  const apiKey = c.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.error("EMAIL_API_KEY not found in environment");
    throw new Error("Email API key not configured");
  }

  const resend = new Resend(apiKey);

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [to],
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Failed to send email");
  }
}
