"use client";

import { FormEvent, useId, useRef, useState } from "react";
import { validateSignup, type SignupField } from "../lib/newsletter-validation";

type FormState = "idle" | "submitting" | "success" | "error";

export default function NewsletterSignup({ available = false, privacyUrl }: { available?: boolean; privacyUrl?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [invalidField, setInvalidField] = useState<SignupField>();
  const statusId = useId();
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = { name: data.get("name"), email: data.get("email"), consent: data.get("consent") === "on", website: data.get("website") };
    const validation = validateSignup(payload);
    if ("error" in validation) {
      setInvalidField(validation.field);
      setState("error");
      setMessage(validation.error);
      (form.elements.namedItem(validation.field || "name") as HTMLElement)?.focus();
      return;
    }
    submitting.current = true;
    setInvalidField(undefined);

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const result = (await response.json()) as { message?: string; error?: string; field?: SignupField };

      if (!response.ok) {
        setInvalidField(result.field);
        if (result.field) (form.elements.namedItem(result.field) as HTMLElement)?.focus();
        throw new Error(result.error || "We could not add you right now.");
      }

      setState("success");
      setMessage(result.message || "Check your inbox to confirm your subscription.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name) ? "The request took too long. Please try again." : error instanceof TypeError ? "Check your connection and try again." : error instanceof Error ? error.message : "We could not add you right now.");
    } finally {
      submitting.current = false;
    }
  }

  if (!available) return <p className="newsletter-unavailable" role="status">Newsletter signups are temporarily unavailable. Please check back soon.</p>;

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <div className="newsletter-fields">
        <label>
          <span>Your name</span>
          <input name="name" type="text" autoComplete="name" minLength={2} maxLength={80} placeholder="Ama Mensah" required aria-invalid={invalidField === "name"} aria-describedby={invalidField === "name" ? statusId : undefined} />
        </label>
        <label>
          <span>Email address</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="ama@example.com" required aria-invalid={invalidField === "email"} aria-describedby={invalidField === "email" ? statusId : undefined} />
        </label>
      </div>
      <label className="signup-hp" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="newsletter-consent">
        <input name="consent" type="checkbox" required aria-invalid={invalidField === "consent"} aria-describedby={invalidField === "consent" ? statusId : undefined} />
        <span>I agree to receive Swerve Music news, artist stories, releases and live-show updates. I can unsubscribe at any time.</span>
      </label>
      {privacyUrl && <a className="text-link" href={privacyUrl}>Read our privacy policy</a>}
      <div className="newsletter-submit-row">
        <button className="button button-dark" type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Joining…" : "Join the newsletter"}
        </button>
        <p id={statusId} className={`newsletter-status ${state}`} aria-live="polite" role="status">
          {message}
        </p>
      </div>
    </form>
  );
}
