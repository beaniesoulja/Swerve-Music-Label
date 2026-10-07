import { and, eq, isNotNull } from "drizzle-orm";
import { getDb } from "../db";
import { newsletterSubscribers as subscribers } from "../db/schema";
import { siteUrl } from "../app/site-config";
import { unsubscribeToken } from "../app/lib/newsletter-tokens";

// Explicit operator command. Contains personal data; never expose this as a public route.
const origin = siteUrl();
if (!origin) throw new Error("Set the verified HTTPS SITE_URL first.");
const rows = await getDb().select({ id: subscribers.id, name: subscribers.name, email: subscribers.email, version: subscribers.subscriptionVersion })
  .from(subscribers).where(and(eq(subscribers.status, "subscribed"), isNotNull(subscribers.confirmedAt), isNotNull(subscribers.subscriptionVersion)));
function csv(value: string) {
  // Prevent spreadsheet formula execution on user-supplied names.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
console.log("name,email,unsubscribe_url");
for (const row of rows) {
  const url = new URL("/newsletter/unsubscribe", origin);
  url.searchParams.set("token", unsubscribeToken(row.id, row.version!));
  console.log([row.name, row.email, url.href].map(csv).join(","));
}
