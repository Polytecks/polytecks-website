"use server";

import { Resend } from "resend";

/**
 * Contact-form server action. Validates the submitted fields, drops
 * spam-flagged submissions silently (honeypot), and sends the body to
 * the Polytecks inbox via Resend. The sender's address is set as the
 * Reply-To so a click-to-reply lands back at the actual contact.
 */
const resend = new Resend(process.env.RESEND_API_KEY);
const TO_ADDRESS = "contact@polytecks.com";
const FROM_ADDRESS = "Polytecks Website <noreply@polytecks.com>";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: bots typically fill every input. The "website" field is
  // hidden via CSS off-screen, so a real human never touches it. Any
  // non-empty value here = bot — drop silently with a "success" reply
  // so the bot thinks it worked and doesn't retry.
  if (field(formData, "website")) {
    return { status: "success" };
  }

  const firstName = field(formData, "firstName");
  const lastName = field(formData, "lastName");
  const email = field(formData, "email");
  const jobTitle = field(formData, "jobTitle");
  const company = field(formData, "company");
  const message = field(formData, "message");

  if (!firstName || !lastName || !email || !message) {
    return {
      status: "error",
      message: "Please fill in all required fields.",
    };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const subject =
    `Contact form: ${firstName} ${lastName}` +
    (company ? ` — ${company}` : "");

  const text = [
    "New contact form submission from polytecks.com",
    "",
    `Name:      ${firstName} ${lastName}`,
    `Email:     ${email}`,
    `Job title: ${jobTitle || "—"}`,
    `Company:   ${company || "—"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      replyTo: email,
      subject,
      text,
    });
    if (error) {
      console.error("[contact form] resend error:", error);
      return {
        status: "error",
        message: "We couldn't send your message. Please try again shortly.",
      };
    }
    return { status: "success" };
  } catch (err) {
    console.error("[contact form] unexpected error:", err);
    return {
      status: "error",
      message: "We couldn't send your message. Please try again shortly.",
    };
  }
}
