import { confirmSubscription, unsubscribe } from "./newsletter-service";
import { newsletterReady } from "./newsletter-config";
import { crossSiteRequest, hasContentType } from "./newsletter-request";
import { readSmallBody } from "./newsletter-validation";

export async function newsletterAction(request: Request, action: "confirm" | "unsubscribe") {
  const url = new URL(request.url);
  if (crossSiteRequest(request)) return new Response("Please use the form on this website.", { status: 403 });
  if (!hasContentType(request, "application/x-www-form-urlencoded")) return new Response("Invalid form.", { status: 415 });
  const destination = new URL(`/newsletter/${action}`, url.origin);
  let token: string;
  try { token = new URLSearchParams(await readSmallBody(request)).get("token") || ""; }
  catch { return new Response("Invalid form.", { status: 400 }); }
  if (!process.env.DATABASE_URL || (process.env.NEWSLETTER_TOKEN_SECRET?.length ?? 0) < 32 || (action === "confirm" && !newsletterReady())) {
    return new Response("This service is temporarily unavailable. Please try the link again later.", { status: 503, headers: { "Retry-After": "3600", "Cache-Control": "no-store" } });
  }
  try {
    const success = action === "confirm" ? await confirmSubscription(token) : await unsubscribe(token);
    destination.searchParams.set("result", success ? "success" : "invalid");
    return new Response(null, { status: 303, headers: { Location: destination.href, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch {
    console.error(`Newsletter ${action} failed.`);
    return new Response("We could not complete this request. Please try the link again later.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
