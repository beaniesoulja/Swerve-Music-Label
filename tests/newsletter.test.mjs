import assert from "node:assert/strict";
import { after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { newsletterSubscribers as subscribers, newsletterRateLimits as limits } from "../db/schema.ts";
import { validateSignup, readSmallBody } from "../app/lib/newsletter-validation.ts";
import { privateKey, tokenHash, unsubscribeToken, verifyUnsubscribeToken } from "../app/lib/newsletter-tokens.ts";
import { requestSubscription, confirmSubscription, unsubscribe, signupRateAllowed } from "../app/lib/newsletter-service.ts";
import { POST } from "../app/api/newsletter/route.ts";

process.env.NEWSLETTER_TOKEN_SECRET = "test-only-secret-that-is-not-a-real-credential";
process.env.SITE_URL = "https://example.test";
delete process.env.DATABASE_URL;
delete process.env.NEWSLETTER_ENABLED;
const pg = new PGlite();
const db = drizzle(pg);
const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
for (const entry of journal.entries) await pg.exec(await readFile(new URL(`../drizzle/${entry.tag}.sql`, import.meta.url), "utf8"));
after(() => pg.close());

test("normalizes input and rejects wrong shapes, invalid emails, and absent consent", () => {
  assert.deepEqual(validateSignup({ name: "  QA   Person ", email: "QA@EXAMPLE.TEST ", consent: true }), { value: { name: "QA Person", email: "qa@example.test", consent: true } });
  for (const body of [null, [], "text", 5]) assert.ok("error" in validateSignup(body));
  assert.equal(validateSignup({ name: "Q", email: "qa@example.test", consent: true }).field, "name");
  assert.equal(validateSignup({ name: "QA", email: "bad", consent: true }).field, "email");
  assert.equal(validateSignup({ name: "QA", email: "qa@example.test", consent: "true" }).field, "consent");
  assert.ok("honeypot" in validateSignup({ website: "bot" }));
});

test("bounds request bodies without depending on Content-Length", async () => {
  await assert.rejects(readSmallBody(new Request("https://example.test", { method: "POST", body: "x".repeat(4097) })), RangeError);
});

test("API rejects malformed JSON, cross-origin requests, and unsupported content types", async () => {
  for (const [body, status] of [["{", 400], ["null", 400], ["[]", 400], ["{}", 400], [JSON.stringify({ name: "QA", email: "qa@example.test", consent: true }), 503]]) {
    const result = await POST(new Request("https://example.test/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body }));
    assert.equal(result.status, status);
  }
  assert.equal((await POST(new Request("https://example.test/api/newsletter", { method: "POST", headers: { Origin: "https://attacker.test", "Content-Type": "application/json" }, body: "{}" }))).status, 403);
  assert.equal((await POST(new Request("https://example.test/api/newsletter", { method: "POST", body: "{}" }))).status, 415);
});

test("unsubscribe tokens reject tampering and another signing key", () => {
  const version = "a".repeat(32);
  const token = unsubscribeToken(3, version);
  assert.deepEqual(verifyUnsubscribeToken(token), { id: 3, version });
  assert.equal(verifyUnsubscribeToken(token.replace(/^3/, "4")), null);
  assert.equal(verifyUnsubscribeToken(token, "different-secret"), null);
  assert.equal(verifyUnsubscribeToken("anything"), null);
});

test("real Postgres migrations support confirmation, single use, suppression, and safe resubscription", async (t) => {
  const emails = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    emails.push(JSON.parse(options.body));
    return Response.json({ id: "test-email" });
  });
  const signup = { name: "QA Person", email: "lifecycle@example.test", consent: true };
  const row = async () => (await db.select().from(subscribers).where(eq(subscribers.email, signup.email)))[0];
  const latestToken = () => new URL(emails.filter(e => e.subject.startsWith("Confirm" )).at(-1).text.match(/https:\/\/\S+/)[0]).searchParams.get("token");
  await requestSubscription(signup, db);
  assert.equal((await row()).status, "pending");
  const firstToken = latestToken();
  assert.equal((await row()).confirmationTokenHash, tokenHash(firstToken));
  assert.equal(await confirmSubscription("f".repeat(64), db), false);
  assert.equal(await confirmSubscription(firstToken, db), true);
  assert.equal(await confirmSubscription(firstToken, db), false);
  const confirmed = await row();
  assert.equal(confirmed.status, "subscribed");
  assert.ok(confirmed.confirmedAt);
  const count = emails.length;
  await requestSubscription({ ...signup, name: "Unverified replacement" }, db);
  assert.equal((await row()).name, signup.name);
  assert.equal(emails.length, count);
  const removalToken = unsubscribeToken(confirmed.id, confirmed.subscriptionVersion);
  assert.equal(await unsubscribe(removalToken, db), true);
  assert.equal(await unsubscribe(removalToken, db), true);
  await requestSubscription({ ...signup, name: "Updated name" }, db);
  assert.equal((await row()).status, "unsubscribed");
  assert.equal((await row()).name, signup.name);
  assert.equal(await confirmSubscription(latestToken(), db), true);
  assert.equal((await row()).name, "Updated name");
  assert.equal(await unsubscribe(removalToken, db), false);
});

test("expired confirmations and failed delivery never activate subscribers", async (t) => {
  let token;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    token = new URL(JSON.parse(options.body).text.match(/https:\/\/\S+/)[0]).searchParams.get("token");
    return new Response("unavailable", { status: 503 });
  });
  const email = "failure@example.test";
  await assert.rejects(requestSubscription({ name: "QA", email, consent: true }, db));
  await db.update(subscribers).set({ confirmationExpiresAt: new Date(0) }).where(eq(subscribers.email, email));
  assert.equal(await confirmSubscription(token, db), false);
  const [row] = await db.select().from(subscribers).where(eq(subscribers.email, email));
  assert.equal(row.status, "pending");
});

test("legacy unconfirmed subscribers can confirm without treating old records as consent", async (t) => {
  let token;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    const message = JSON.parse(options.body);
    if (message.subject.startsWith("Confirm")) token = new URL(message.text.match(/https:\/\/\S+/)[0]).searchParams.get("token");
    return Response.json({ id: "test-email" });
  });
  const email = "legacy@example.test";
  await db.insert(subscribers).values({ name: "Legacy", email, status: "subscribed" });
  await requestSubscription({ name: "Confirmed owner", email, consent: true }, db);
  let [row] = await db.select().from(subscribers).where(eq(subscribers.email, email));
  assert.equal(row.confirmedAt, null);
  assert.equal(row.name, "Legacy");
  assert.equal(await confirmSubscription(token, db), true);
  [row] = await db.select().from(subscribers).where(eq(subscribers.email, email));
  assert.equal(row.name, "Confirmed owner");
  assert.ok(row.confirmedAt);
});

test("durable atomic rate limits bound email requests, expire, and store no raw address", async () => {
  const email = "rate@example.test";
  const request = new Request("https://example.test/api/newsletter");
  for (let n = 0; n < 3; n++) assert.equal(await signupRateAllowed(email, request, db), true);
  assert.equal(await signupRateAllowed(email, request, db), false);
  const rows = await db.select().from(limits);
  assert.ok(rows.every(row => /^[a-f0-9]{64}$/.test(row.key)));
  await db.update(limits).set({ resetAt: new Date(0) }).where(eq(limits.key, privateKey(`email:${email}`)));
  assert.equal(await signupRateAllowed(email, request, db), true);
  await db.update(limits).set({ attempts: 200 }).where(eq(limits.key, privateKey("global")));
  assert.equal(await signupRateAllowed("another@example.test", request, db), false);
});
