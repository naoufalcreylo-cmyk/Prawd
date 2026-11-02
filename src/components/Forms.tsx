"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessage, subscribe } from "@/lib/actions";
import { idleState, type FormState } from "@/lib/forms";

function Message({ state, id }: { state: FormState; id: string }) {
  return (
    <p id={id} className="form-message" role="status" data-status={state.status}>
      {state.message && state.status !== "success" ? <span className="form-message__mark" aria-hidden="true" /> : null}
      {state.message}
    </p>
  );
}

function Honeypot() {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** After a failed submit, move focus to the first field with a problem. */
function useFocusFirstError(state: FormState, form: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state.status === "invalid") {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
    if (state.status === "success") form.current?.reset();
  }, [state, form]);
}

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, idleState);
  const form = useRef<HTMLFormElement>(null);
  useFocusFirstError(state, form);
  const invalid = Boolean(state.errors.email);

  return (
    <form ref={form} action={action} noValidate className="newsletter__form">
      <Honeypot />
      <label htmlFor="newsletter-email" className="visually-hidden">
        Email address
      </label>
      <div className="inline-field" data-invalid={invalid}>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Your email address"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values.email ?? ""}
          key={state.values.email ?? ""}
          aria-invalid={invalid || undefined}
          aria-describedby="newsletter-message"
        />
        <button type="submit" disabled={pending}>
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <Message state={state} id="newsletter-message" />
    </form>
  );
}

function Field({
  name,
  label,
  state,
  ...props
}: {
  name: string;
  label: string;
  state: FormState;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
}) {
  const { textarea, ...input } = props;
  const error = state.errors[name];
  const shared = {
    id: `contact-${name}`,
    name,
    required: true,
    defaultValue: state.values[name] ?? "",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `contact-${name}-error` : undefined,
  };
  return (
    <div className="field">
      <label htmlFor={shared.id}>{label}</label>
      {textarea ? <textarea {...shared} /> : <input {...input} {...shared} />}
      {error ? (
        <p className="field__error" id={`contact-${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, idleState);
  const form = useRef<HTMLFormElement>(null);
  useFocusFirstError(state, form);

  return (
    <form ref={form} action={action} noValidate className="form">
      <Honeypot />
      <div key={JSON.stringify(state.values)} style={{ display: "contents" }}>
        <Field name="name" label="Your name" autoComplete="name" state={state} />
        <Field name="email" label="Email address" type="email" autoComplete="email" state={state} />
        <div className="field">
          <label htmlFor="contact-topic">What is it about?</label>
          <select id="contact-topic" name="topic" defaultValue={state.values.topic ?? "General"}>
            <option>General</option>
            <option>Story idea</option>
            <option>Photography</option>
            <option>Correction</option>
          </select>
        </div>
        <Field name="message" label="Message" textarea state={state} />
      </div>
      <button type="submit" className="button" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
      <Message state={state} id="contact-message" />
    </form>
  );
}
