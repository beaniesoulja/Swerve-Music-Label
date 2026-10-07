import { confirmationMessage, newsletterReady, newsletterUnavailable } from "../../lib/newsletter-config";
import { requestSubscription, signupRateAllowed } from "../../lib/newsletter-service";
import { readSmallBody, validateSignup } from "../../lib/newsletter-validation";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Please submit the form from this website." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Expected a JSON form." }, { status: 415 });
  let payload: unknown;
  try { payload = JSON.parse(await readSmallBody(request)); }
  catch (error) { return Response.json({ error: "Please send a valid signup form." }, { status: error instanceof RangeError ? 413 : 400 }); }
  const result = validateSignup(payload);
  if ("error" in result) return Response.json(result, { status: 400 });
  if ("honeypot" in result) return Response.json({ message: confirmationMessage }, { status: 202 });
  if (!newsletterReady()) return Response.json({ error: newsletterUnavailable }, { status: 503, headers: { "Retry-After": "3600" } });
  try {
    if (!await signupRateAllowed(result.value.email, request)) return Response.json({ error: "Too many attempts. Please try again in an hour." }, { status: 429, headers: { "Retry-After": "3600" } });
    await requestSubscription(result.value);
    return Response.json({ message: confirmationMessage }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Newsletter signup failed. Check database migrations and email-provider configuration.");
    return Response.json({ error: "We could not send your confirmation. Please try again shortly." }, { status: 503 });
  }
}
