"use server";

import {
  sendContactWithResend,
  subscribeWithButtondown,
  validateContact,
  validateEmail,
  type FormState,
} from "./forms";

const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim();

export async function subscribe(_: FormState, data: FormData): Promise<FormState> {
  const email = field(data, "email");
  const values = { email };

  // Honeypot: people can't see this field, so anything in it came from a bot.
  if (field(data, "company")) {
    return { status: "failed", message: "We couldn't process that. Please try again.", errors: {}, values };
  }

  const error = validateEmail(email);
  if (error) return { status: "invalid", message: error, errors: { email: error }, values };

  const result = await subscribeWithButtondown(email);
  switch (result) {
    case "success":
      return {
        status: "success",
        message: "You're on the list. Check your inbox in case there's a confirmation email.",
        errors: {},
        values: {},
      };
    case "duplicate":
      return { status: "duplicate", message: "That address is already subscribed.", errors: {}, values };
    case "not_configured":
      return {
        status: "not_configured",
        message: "Sign-ups aren't open yet, so your address has not been saved. Please come back soon.",
        errors: {},
        values,
      };
    default:
      return {
        status: "failed",
        message: "Something went wrong and you haven't been subscribed. Please try again in a moment.",
        errors: {},
        values,
      };
  }
}

export async function sendMessage(_: FormState, data: FormData): Promise<FormState> {
  const values = {
    name: field(data, "name"),
    email: field(data, "email"),
    topic: field(data, "topic") || "General",
    message: field(data, "message"),
  };

  if (field(data, "company")) {
    return { status: "failed", message: "We couldn't process that. Please try again.", errors: {}, values };
  }

  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) {
    return { status: "invalid", message: "Please check the highlighted fields.", errors, values };
  }

  const result = await sendContactWithResend(values);
  if (result === "success") {
    return { status: "success", message: "Thank you. Your message has been sent.", errors: {}, values: {} };
  }
  if (result === "not_configured") {
    return {
      status: "not_configured",
      message:
        "The contact form isn't connected yet, so your message has not been sent. Please keep a copy and try again later.",
      errors: {},
      values,
    };
  }
  return {
    status: "failed",
    message: "Something went wrong and your message hasn't been sent. Please try again in a moment.",
    errors: {},
    values,
  };
}
