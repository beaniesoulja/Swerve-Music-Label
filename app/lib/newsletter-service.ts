import { randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lte, ne, or, sql } from "drizzle-orm";
import { getDb } from "../../db";
import { newsletterRateLimits as limits, newsletterSubscribers as subscribers } from "../../db/schema";
import { siteUrl } from "../site-config";
import { newConfirmationToken, privateKey, tokenHash, unsubscribeToken, verifyUnsubscribeToken } from "./newsletter-tokens";
import type { Signup } from "./newsletter-validation";

// Atomic shared counters work across serverless instances. Only HMAC keys are stored.
async function allow(key: string, maximum: number, db = getDb()) {
  const [row] = await db.insert(limits).values({ key: privateKey(key), attempts: 1, resetAt: new Date(Date.now() + 3600000) })
    .onConflictDoUpdate({ target: limits.key, set: {
      attempts: sql`CASE WHEN ${limits.resetAt} <= CURRENT_TIMESTAMP THEN 1 ELSE ${limits.attempts} + 1 END`,
      resetAt: sql`CASE WHEN ${limits.resetAt} <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + INTERVAL '1 hour' ELSE ${limits.resetAt} END`,
    } }).returning({ attempts: limits.attempts });
  return row.attempts <= maximum;
}
export async function signupRateAllowed(email: string, request: Request, db = getDb()) {
  if (!await allow("global", 200, db)) return false;
  // Configure only a header overwritten by the trusted hosting proxy.
  const trustedHeader = process.env.TRUSTED_CLIENT_IP_HEADER;
  const ip = trustedHeader ? request.headers.get(trustedHeader) : null;
  if (ip && !await allow(`ip:${ip.slice(0,200)}`, 20, db)) return false;
  if (!await allow(`email:${email}`, 3, db)) return false;
  await db.delete(limits).where(lte(limits.resetAt, new Date()));
  return true;
}
export async function sendNewsletterEmail(to: string, subject: string, text: string, idempotencyKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from: process.env.NEWSLETTER_FROM_EMAIL, to: [to], subject, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Email provider unavailable");
}
export async function requestSubscription({ name, email }: Signup, db = getDb()) {
  const token = newConfirmationToken();
  const hash = tokenHash(token);
  const [row] = await db.insert(subscribers).values({ name, email, status: "pending", pendingName: name,
    confirmationTokenHash: hash, confirmationExpiresAt: new Date(Date.now() + 86400000) })
    .onConflictDoUpdate({ target: subscribers.email, set: {
      pendingName: name, confirmationTokenHash: hash, confirmationExpiresAt: new Date(Date.now() + 86400000), updatedAt: new Date(),
    }, setWhere: or(ne(subscribers.status, "subscribed"), isNull(subscribers.confirmedAt)) }).returning({ id: subscribers.id });
  // Existing subscribers cannot be overwritten through this public endpoint.
  if (!row) return;
  const url = new URL("/newsletter/confirm", siteUrl());
  url.searchParams.set("token", token);
  await sendNewsletterEmail(email, "Confirm your Swerve Music newsletter signup",
    `Confirm your signup to receive Swerve Music news, artist stories, releases and live-show updates:\n\n${url.href}\n\nThis link expires in 24 hours. If you did not request this, ignore this email. You will not be subscribed without confirmation.`, `confirm-${hash}`);
}
export async function confirmSubscription(token: string, db = getDb()) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const [row] = await db.update(subscribers).set({
    status: "subscribed", name: sql`COALESCE(${subscribers.pendingName}, ${subscribers.name})`, pendingName: null,
    confirmationTokenHash: null, confirmationExpiresAt: null, confirmedAt: new Date(), consentAt: new Date(), updatedAt: new Date(),
    subscriptionVersion: randomBytes(16).toString("hex"),
  }).where(and(eq(subscribers.confirmationTokenHash, tokenHash(token)), gt(subscribers.confirmationExpiresAt, new Date())))
    .returning({ id: subscribers.id, version: subscribers.subscriptionVersion, email: subscribers.email });
  if (!row?.version) return false;
  const url = new URL("/newsletter/unsubscribe", siteUrl());
  url.searchParams.set("token", unsubscribeToken(row.id, row.version));
  try {
    await sendNewsletterEmail(row.email, "Welcome to the Swerve Music newsletter",
      `Your subscription is confirmed.\n\nYou can unsubscribe at any time:\n${url.href}`, `welcome-${row.id}-${row.version}`);
  } catch { console.error("Newsletter welcome email failed; subscription was confirmed."); }
  return true;
}
export async function unsubscribe(token: string, db = getDb()) {
  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) return false;
  const [row] = await db.update(subscribers).set({ status: "unsubscribed", updatedAt: new Date(),
    confirmationTokenHash: null, confirmationExpiresAt: null, pendingName: null })
    .where(and(eq(subscribers.id, parsed.id), eq(subscribers.subscriptionVersion, parsed.version))).returning({ id: subscribers.id });
  return Boolean(row);
}
