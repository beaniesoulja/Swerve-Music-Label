// Public configuration only. Never export database, signing, or provider secrets here.
export function siteUrl(): URL | undefined {
  try {
    const url = new URL(process.env.SITE_URL || "");
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return new URL(url.origin);
  } catch { return undefined; }
}
export function approvedPolicyUrl(kind: "privacy" | "terms"): string | undefined {
  try {
    const url = new URL(process.env[kind === "privacy" ? "PRIVACY_POLICY_URL" : "TERMS_URL"] || "");
    return url.protocol === "https:" ? url.href : undefined;
  } catch { return undefined; }
}
export function contactEmail(kind: "artists" | "bookings" | "culture"): string | undefined {
  if (process.env.CONTACT_EMAIL_ENABLED !== "true") return undefined;
  const value = process.env[`CONTACT_${kind.toUpperCase()}_EMAIL`];
  return value && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value) ? value : undefined;
}
export function socialLinks() {
  return ["Instagram", "TikTok", "YouTube"].flatMap((label) => {
    try {
      const url = new URL(process.env[`SOCIAL_${label.toUpperCase()}_URL`] || "");
      return url.protocol === "https:" ? [{ label, href: url.href }] : [];
    } catch { return []; }
  });
}
