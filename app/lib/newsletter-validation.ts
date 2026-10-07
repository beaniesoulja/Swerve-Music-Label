export type Signup = { name: string; email: string; consent: true };
export type SignupField = "name" | "email" | "consent";
export type Validation = { value: Signup } | { error: string; field?: SignupField } | { honeypot: true };
export function validateSignup(payload: unknown): Validation {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { error: "Please send a valid signup form." };
  const data = payload as Record<string, unknown>;
  if (typeof data.website === "string" && data.website.trim()) return { honeypot: true };
  const name = typeof data.name === "string" ? data.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (name.length < 2 || name.length > 80) return { error: "Enter a name between 2 and 80 characters.", field: "name" };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address.", field: "email" };
  if (data.consent !== true) return { error: "Confirm that you want to receive the newsletter.", field: "consent" };
  return { value: { name, email, consent: true } };
}
export async function readSmallBody(request: Request, maxBytes = 4096): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RangeError("Request too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
