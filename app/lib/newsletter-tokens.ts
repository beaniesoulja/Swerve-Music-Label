import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function newConfirmationToken() { return randomBytes(32).toString("hex"); }
export function signingSecret() {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error("Newsletter signing secret unavailable");
  return secret;
}
export function privateKey(value: string, secret = signingSecret()) {
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function unsubscribeToken(id: number, version: string, secret = signingSecret()) {
  const payload = `${id}.${version}`;
  return `${payload}.${privateKey(`unsubscribe:${payload}`, secret)}`;
}
export function verifyUnsubscribeToken(token: string, secret = signingSecret()): { id: number; version: string } | null {
  if (!/^\d+\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return null;
  const [id, version, signature] = token.split(".");
  const expected = privateKey(`unsubscribe:${id}.${version}`, secret);
  if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) return null;
  const numericId = Number(id);
  return Number.isSafeInteger(numericId) && numericId > 0 ? { id: numericId, version } : null;
}
