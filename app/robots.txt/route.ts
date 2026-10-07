import { siteUrl } from "../site-config";
export function GET() {
  const url = siteUrl();
  return new Response(url ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /newsletter/\nSitemap: ${new URL("/sitemap.xml", url).href}\n` : "User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
