import { siteUrl } from "../site-config";
export function GET() {
  const url = siteUrl();
  const location = url?.href.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${location ? `<url><loc>${location}</loc></url>` : ""}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
