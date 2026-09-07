"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function NewsletterSignup() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "We could not add you right now.");
      }

      setState("success");
      setMessage(result.message || "You are on the list. Welcome to the movement.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not add you right now.");
    }
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <div className="newsletter-fields">
        <label>
          <span>Your name</span>
          <input name="name" type="text" autoComplete="name" maxLength={80} placeholder="Ama Mensah" required />
        </label>
        <label>
          <span>Email address</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="ama@example.com" required />
        </label>
      </div>
      <label className="signup-hp" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="newsletter-consent">
        <input name="consent" type="checkbox" required />
        <span>I agree to receive Swerve Music news, artist stories, releases and live-show updates. I can unsubscribe at any time.</span>
      </label>
      <div className="newsletter-submit-row">
        <button className="button button-dark" type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Joining…" : "Join the newsletter"} <span>↗</span>
        </button>
        <p className={`newsletter-status ${state}`} aria-live="polite" role="status">
          {message}
        </p>
      </div>
    </form>
  );
}
