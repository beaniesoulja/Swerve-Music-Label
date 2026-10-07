import { approvedPolicyUrl, siteUrl } from "../site-config";
export function newsletterReady() {
  return Boolean(process.env.NEWSLETTER_ENABLED === "true" && process.env.DATABASE_URL &&
    process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL &&
    (process.env.NEWSLETTER_TOKEN_SECRET?.length ?? 0) >= 32 && siteUrl() && approvedPolicyUrl("privacy"));
}
export const newsletterUnavailable = "Newsletter signups are temporarily unavailable. Please check back soon.";
export const confirmationMessage = "If this address needs confirmation, an email is on its way. Check your inbox and spam folder.";
