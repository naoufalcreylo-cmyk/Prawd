export type FormStatus = "idle" | "success" | "invalid" | "not_configured" | "failed" | "duplicate";

export type FormState = {
  status: FormStatus;
  message: string;
  errors: Record<string, string>;
  values: Record<string, string>;
};

export const idleState: FormState = { status: "idle", message: "", errors: {}, values: {} };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  if (!value) return "Enter your email address.";
  if (value.length > 254 || !EMAIL.test(value)) return "Enter a valid email address, like name@example.com.";
  return null;
}

export function validateContact(values: { name: string; email: string; message: string }) {
  const errors: Record<string, string> = {};
  if (!values.name) errors.name = "Enter your name.";
  else if (values.name.length > 120) errors.name = "Keep your name under 120 characters.";
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  if (values.message.length < 10) errors.message = "Write a message of at least 10 characters.";
  else if (values.message.length > 5000) errors.message = "Keep your message under 5,000 characters.";
  return errors;
}

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export async function subscribeWithButtondown(
  email: string,
  env: Env = process.env,
  doFetch: Fetch = fetch,
): Promise<"success" | "not_configured" | "duplicate" | "failed"> {
  const key = env.BUTTONDOWN_API_KEY;
  if (!key) return "not_configured";
  try {
    const response = await doFetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: email }),
    });
    if (response.ok) return "success";
    // Buttondown answers 400 for an existing subscriber as well as for other bad requests.
    if (response.status === 400 && /already|exists/i.test(await response.text())) return "duplicate";
    return "failed";
  } catch {
    return "failed";
  }
}

export async function sendContactWithResend(
  message: { name: string; email: string; topic: string; message: string },
  env: Env = process.env,
  doFetch: Fetch = fetch,
): Promise<"success" | "not_configured" | "failed"> {
  const { RESEND_API_KEY: key, CONTACT_TO_EMAIL: to, CONTACT_FROM_EMAIL: from } = env;
  if (!key || !to || !from) return "not_configured";
  const safeName = message.name.replace(/[\r\n]+/g, " ");
  try {
    const response = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: message.email,
        subject: `[PRAWD] ${message.topic}: ${safeName}`,
        text: `From: ${safeName} <${message.email}>\nTopic: ${message.topic}\n\n${message.message}`,
      }),
    });
    return response.ok ? "success" : "failed";
  } catch {
    return "failed";
  }
}
