import assert from "node:assert/strict";
import { access, readdir } from "node:fs/promises";
import test, { after } from "node:test";
import { unstable_dev } from "wrangler";

// Run the actual built Worker, including cloudflare: imports, in workerd.
// Explicit empty bindings keep this suite disconnected from production services.
const startWorker = (vars = {}) => unstable_dev("dist/server/index.js", {
  config: "dist/server/wrangler.json", local: true, ip: "127.0.0.1", port: 0,
  persist: false, bundle: false, logLevel: "error", envFiles: [],
  vars: { NEWSLETTER_ENABLED: "false", DATABASE_URL: "", SITE_URL: "", CONTACT_EMAIL_ENABLED: "false", RESEND_API_KEY: "", ...vars },
  experimental: { disableExperimentalWarning: true, disableDevRegistry: true, watch: false, enableContainers: false },
});
const worker = await startWorker();
after(() => worker.stop());
const request = (path, options) => worker.fetch(path, options);

test("production homepage renders real content and safe unavailable service states", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Swerve Music/);
  assert.match(html, /We move/);
  assert.match(html, /Beanie/);
  assert.match(html, /Newsletter signups are temporarily unavailable/);
  assert.match(html, /Email enquiries are temporarily unavailable/);
  assert.doesNotMatch(html, /href="mailto:/);
  assert.doesNotMatch(html, /supplied masters|New Music Weekly|Your site is taking shape/);
  for (const id of ["top", "artists", "music", "culture", "live", "newsletter", "contact"]) assert.ok(html.includes(`id="${id}"`));
  for (const file of ["tkl-preview.mp3", "the-motto-preview.mp3", "capsize-preview.mp3", "burst-down-preview-v3.mp3", "fowosere-preview.mp3", "psycho-preview.mp3", "nsg-preview.mp3"]) await access(new URL(`../public/audio/${file}`, import.meta.url));
});

test("newsletter API distinguishes malformed input and unavailable service", async () => {
  for (const [body, expected] of [["{", 400], ["null", 400], ["{}", 400], [JSON.stringify({ name: "QA", email: "qa@example.test", consent: true }), 503]]) {
    const response = await request("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body });
    assert.equal(response.status, expected);
  }
});

test("discovery routes exist and unconfigured previews are not indexable", async () => {
  const robots = await request("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \//);
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /<urlset/);
});

test("confirmation links require an explicit POST and missing pages return 404", async () => {
  const confirm = await request("/newsletter/confirm?token=" + "a".repeat(64));
  assert.equal(confirm.status, 200);
  const html = await confirm.text();
  assert.match(html, /method="post"/);
  assert.match(html, /Confirm subscription/);
  assert.match(html, /noindex/);
  assert.equal((await request("/qa-nonexistent-page")).status, 404);
});

test("all public assets are served and retired preview URLs redirect to the current audio", async () => {
  const root = new URL("../public/", import.meta.url);
  async function check(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${prefix}${entry.name}`;
      if (entry.isDirectory()) await check(new URL(`${entry.name}/`, directory), `${path}/`);
      else assert.equal((await request(`/${path}`, { method: "HEAD" })).status, 200, path);
    }
  }
  await check(root);
  for (const name of ["burst-down-preview.mp3", "burst-down-preview-v2.mp3"]) {
    const response = await request(`/audio/${name}`, { redirect: "manual" });
    assert.equal(response.status, 307);
    assert.ok(response.headers.get("location").endsWith("/audio/burst-down-preview-v3.mp3"));
  }
});

test("configured public settings render canonical metadata, policy links, and the signup form", async () => {
  // Synthetic settings exercise server rendering only. No signup is submitted.
  const configured = await startWorker({
    SITE_URL: "https://example.test", PRIVACY_POLICY_URL: "https://example.test/privacy",
    TERMS_URL: "https://example.test/terms", NEWSLETTER_ENABLED: "true",
    DATABASE_URL: "postgresql://test@invalid.example.test/test", RESEND_API_KEY: "test-only-not-a-credential",
    NEWSLETTER_FROM_EMAIL: "test@example.test", NEWSLETTER_TOKEN_SECRET: "test-only-secret-not-used-outside-this-suite",
    CONTACT_EMAIL_ENABLED: "true", CONTACT_ARTISTS_EMAIL: "artists@example.test",
    SOCIAL_INSTAGRAM_URL: "https://example.test/instagram",
  });
  try {
    const html = await (await configured.fetch("/")).text();
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0] || "missing canonical link";
    assert.match(canonical, /href="https:\/\/example.test\/?"/);
    assert.match(html, /name="email"/);
    assert.match(html, /Read our privacy policy/);
    assert.match(html, /href="mailto:artists@example.test"/);
    assert.match(html, /href="https:\/\/example.test\/instagram"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(await (await configured.fetch("/robots.txt")).text(), /Sitemap: https:\/\/example.test\/sitemap.xml/);
    assert.match(await (await configured.fetch("/sitemap.xml")).text(), /<loc>https:\/\/example.test\/<\/loc>/);
  } finally { await configured.stop(); }
});
