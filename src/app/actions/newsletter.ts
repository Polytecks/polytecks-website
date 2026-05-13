"use server";

import { Resend } from "resend";

/**
 * Newsletter-signup server action. Adds the email to the Polytecks
 * "Newsletter" audience in Resend. Already-subscribed addresses are
 * treated as success (no need to bother the user about it). Honeypot
 * field below drops obvious bot submissions silently.
 */
const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = "6394441a-b5fb-4cae-8fdb-f8e9a9f47cdd";

export type NewsletterFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function subscribeNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  if (field(formData, "website")) {
    // Honeypot triggered — silent success.
    return { status: "success" };
  }

  const email = field(formData, "newsletterEmail");
  if (!email) {
    return { status: "error", message: "Please enter your email." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    const { error } = await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email,
      unsubscribed: false,
    });
    if (error) {
      // Resend returns a 422 / specific message when the contact
      // already exists in the audience — treat as a successful
      // subscription from the user's perspective.
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("already") || msg.includes("exists")) {
        return { status: "success" };
      }
      console.error("[newsletter] resend error:", error);
      return {
        status: "error",
        message: "We couldn't subscribe you. Please try again shortly.",
      };
    }
    return { status: "success" };
  } catch (err) {
    console.error("[newsletter] unexpected error:", err);
    return {
      status: "error",
      message: "We couldn't subscribe you. Please try again shortly.",
    };
  }
}
