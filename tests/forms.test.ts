import assert from "node:assert/strict";
import { test } from "node:test";
import { sendContactWithResend, subscribeWithButtondown, validateContact, validateEmail } from "../src/lib/forms.ts";

const respond = (status: number, body = "") => (async () => new Response(body, { status })) as typeof fetch;
const message = { name: "A\r\nBcc: x", email: "a@example.com", topic: "General", message: "Hello there, PRAWD." };

test("validateEmail accepts real addresses and rejects others", () => {
  assert.equal(validateEmail("name@example.com"), null);
  for (const bad of ["", "name", "name@", "@example.com", "name@example", "a b@example.com"]) {
    assert.ok(validateEmail(bad), bad);
  }
});

test("validateContact reports each bad field", () => {
  assert.deepEqual(Object.keys(validateContact({ name: "", email: "x", message: "short" })).sort(), [
    "email",
    "message",
    "name",
  ]);
  assert.deepEqual(validateContact({ name: "A", email: "a@example.com", message: "A long enough message" }), {});
});

test("newsletter never reports success without a provider", async () => {
  assert.equal(await subscribeWithButtondown("a@example.com", {}, respond(200)), "not_configured");
});

test("newsletter maps provider responses", async () => {
  const env = { BUTTONDOWN_API_KEY: "key" };
  assert.equal(await subscribeWithButtondown("a@example.com", env, respond(201)), "success");
  assert.equal(
    await subscribeWithButtondown("a@example.com", env, respond(400, '{"code":"email_already_exists"}')),
    "duplicate",
  );
  assert.equal(await subscribeWithButtondown("a@example.com", env, respond(400, '{"code":"bad"}')), "failed");
  assert.equal(await subscribeWithButtondown("a@example.com", env, respond(500)), "failed");
  const offline = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  assert.equal(await subscribeWithButtondown("a@example.com", env, offline), "failed");
});

test("contact needs all three settings before it can succeed", async () => {
  assert.equal(await sendContactWithResend(message, { RESEND_API_KEY: "k" }, respond(200)), "not_configured");
  const env = { RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "to@example.com", CONTACT_FROM_EMAIL: "from@example.com" };
  assert.equal(await sendContactWithResend(message, env, respond(200)), "success");
  assert.equal(await sendContactWithResend(message, env, respond(422)), "failed");
});

test("contact strips line breaks from the subject", async () => {
  let body = "";
  const capture = (async (_: unknown, init: RequestInit) => {
    body = String(init.body);
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  const env = { RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "to@example.com", CONTACT_FROM_EMAIL: "from@example.com" };
  await sendContactWithResend(message, env, capture);
  assert.equal(JSON.parse(body).subject, "[PRAWD] General: A Bcc: x");
  assert.equal(JSON.parse(body).reply_to, "a@example.com");
});
