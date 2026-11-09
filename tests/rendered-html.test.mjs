import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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
const previewFiles = ["tkl-preview.mp3", "the-motto-preview.mp3", "capsize-preview.mp3", "burst-down-preview-v3.mp3", "fowosere-preview.mp3", "psycho-preview.mp3", "nsg-preview.mp3"];

// Plain copyright text is retained; decorative emoji-capable glyphs are not.
const assertNoEmoji = (html) => assert.doesNotMatch(html.replaceAll("©", ""), /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u);

test("production homepage renders real content and safe unavailable service states", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assertNoEmoji(html);
  const title = "Swerve Music · African Roots. Global Sound.";
  const description = "Independent music, art and culture. Rooted in Africa, open to the world.";
  assert.ok(html.includes(`<title>${title}</title>`));
  for (const [attribute, name, content] of [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
  ]) assert.ok(html.includes(`<meta ${attribute}="${name}" content="${content}"`), name);
  assert.match(html, /Selected releases\./);
  assert.doesNotMatch(html, /class="hero-feature"|class="selected-cover"|class="selected-release-heading"/);
  assert.ok(html.indexOf('class="release-preview"') < html.indexOf('class="release-selection"'));
  assert.match(html, /tracks · 30-second previews/);
  assert.match(html, /Beanie/);
  assert.match(html, /Newsletter signups are temporarily unavailable/);
  assert.match(html, /Email enquiries are temporarily unavailable/);
  assert.doesNotMatch(html, /href="mailto:/);
  assert.doesNotMatch(html, /supplied masters|New Music Weekly|Your site is taking shape/);
  assert.match(html, /Beanie Soulja feat\. Easyscope/);
  assert.match(html, /DREAMSVIEWNG feat\. Dapson Ahmir/);
  const trackList = html.match(/<ol class="release-list"[\s\S]*?<\/ol>/)?.[0] || "";
  assert.equal((trackList.match(/https:\/\/open\.spotify\.com\/track\//g) || []).length, 7);
  assert.equal((trackList.match(/https:\/\/music\.apple\.com\/us\/album\/[^" ]+\?i=/g) || []).length, 7);
  assert.equal((trackList.match(/<svg /g) || []).length, 14);
  assert.doesNotMatch(html, /<audio[^>]*autoplay/i);
  assert.doesNotMatch(html, /interview-microphone|In conversation|speaking into a microphone/);
  assert.equal((html.match(/aria-label="Show (?:Official portrait|Studio series|In the room|Across borders) image"/g) || []).length, 4);
  assert.doesNotMatch(html, /church choir|LATEST<br\/>RELEASE/);
  assert.match(html, /Inside Sterling Chilling: Live n Loud in Akure\./);
  assert.match(html, /OOB Records/);
  assert.match(html, /Kabex/);
  assert.match(html, /186(?:<!-- -->)? frames from the night/);
  for (const id of ["top", "artists", "music", "culture", "live", "newsletter", "contact"]) assert.ok(html.includes(`id="${id}"`));
  for (const file of previewFiles) await access(new URL(`../public/audio/${file}`, import.meta.url));
});

for (const file of previewFiles) test(`preview audio supports seeking with exact byte ranges: ${file}`, async () => {
  const bytes = await readFile(new URL(`../public/audio/${file}`, import.meta.url));
  const path = `/audio/${file}`;
  for (const [range, start, end] of [
    ["bytes=1000-1999", 1000, 1999],
    [`bytes=${bytes.length - 64}-`, bytes.length - 64, bytes.length - 1],
    ["bytes=-64", bytes.length - 64, bytes.length - 1],
  ]) {
    const response = await request(path, { headers: { Range: range } });
    assert.equal(response.status, 206, range);
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assert.equal(response.headers.get("content-range"), `bytes ${start}-${end}/${bytes.length}`);
    assert.equal(response.headers.get("content-length"), String(end - start + 1));
    assert.match(response.headers.get("content-type") || "", /^audio\/mpeg/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(start, end + 1));
  }
  const head = await request(path, { method: "HEAD", headers: { Range: "bytes=1000-1999" } });
  assert.equal(head.status, 200, "HEAD ignores Range and describes the complete representation");
  assert.equal(head.headers.get("accept-ranges"), "bytes");
  assert.equal(head.headers.get("content-length"), String(bytes.length));
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  const beyondEnd = await request(path, { headers: { Range: `bytes=${bytes.length}-` } });
  assert.equal(beyondEnd.status, 416);
  assert.equal(beyondEnd.headers.get("content-range"), `bytes */${bytes.length}`);
});

test("audio range requests respect validators and safely ignore unsupported range syntax", async () => {
  const path = "/audio/tkl-preview.mp3";
  const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
  const head = await request(path, { method: "HEAD" });
  const etag = head.headers.get("etag");
  assert.ok(etag, "audio has a cache validator");
  const matching = await request(path, { headers: { Range: "bytes=0-63", "If-Range": etag } });
  assert.equal(matching.status, 206);
  assert.deepEqual(Buffer.from(await matching.arrayBuffer()), bytes.subarray(0, 64));
  for (const headers of [
    { Range: "bytes=0-63", "If-Range": '"outdated-audio"' },
    { Range: "invalid" },
    { Range: "bytes=0-4,10-14" },
  ]) {
    const response = await request(path, { headers });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-range"), null);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  }
});

test("revalidating cached audio updates its seekable range support", async () => {
  const path = "/audio/tkl-preview.mp3";
  const full = await request(path);
  assert.equal(full.status, 200);
  const etag = full.headers.get("etag");
  assert.ok(etag);
  await full.arrayBuffer();
  const cached = await request(path, { headers: { "If-None-Match": etag } });
  assert.equal(cached.status, 304);
  assert.equal(cached.headers.get("accept-ranges"), "bytes");
  assert.equal((await cached.arrayBuffer()).byteLength, 0);
});

test("pages prevent framing and MIME sniffing without leaking newsletter tokens in referrers", async () => {
  for (const [path, referrerPolicy] of [
    ["/", "strict-origin-when-cross-origin"],
    ["/newsletter/confirm?token=" + "a".repeat(64), "no-referrer"],
    ["/newsletter/unsubscribe?token=1." + "a".repeat(32) + "." + "b".repeat(64), "no-referrer"],
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.match(response.headers.get("content-security-policy") || "", /(?:^|;)\s*frame-ancestors 'none'(?:;|$)/);
    assert.equal(response.headers.get("referrer-policy"), referrerPolicy);
    await response.arrayBuffer();
  }
  for (const action of ["confirm", "unsubscribe"]) {
    const response = await request(`/api/newsletter/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "token=" + "a".repeat(64),
    });
    assert.equal(response.status, 503, "isolated test services remain disabled");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    await response.arrayBuffer();
  }
});

test("newsletter API distinguishes malformed input and unavailable service", async () => {
  for (const [body, expected] of [["{", 400], ["null", 400], ["{}", 400], [JSON.stringify({ name: "QA", email: "qa@example.test", consent: true }), 503]]) {
    const response = await request("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body });
    assert.equal(response.status, expected);
  }
});

test("verified shared enquiry inbox renders in every contact category", async () => {
  const configured = await startWorker({ CONTACT_EMAIL_ENABLED: "" });
  try {
    const html = await (await configured.fetch("/")).text();
    assertNoEmoji(html);
    assert.equal((html.match(/href="mailto:hello@swervemusic\.org"/g) || []).length, 5);
    assert.match(html, /href="mailto:hello@swervemusic\.org">Contact us<\/a>/);
    assert.doesNotMatch(html, />hello@swervemusic\.org<\/a>/);
    assert.doesNotMatch(html, /Email enquiries are temporarily unavailable|Booking enquiries are temporarily unavailable/);
    assert.match(html, /Newsletter signups are temporarily unavailable/);
  } finally { await configured.stop(); }
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
  for (const suffix of [".jpg", "-480.webp", "-900.webp", "-1200.webp"]) {
    assert.equal((await request(`/artist/beanie-soulja/interview-microphone${suffix}`)).status, 404);
  }
});

test("all public assets are served and retired preview URLs redirect to the current audio", async () => {
  const root = new URL("../public/", import.meta.url);
  async function check(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${prefix}${entry.name}`;
      if (entry.isDirectory()) await check(new URL(`${entry.name}/`, directory), `${path}/`);
      else if (path === "_headers") continue;
      else assert.equal((await request(`/${path}`, { method: "HEAD" })).status, 200, path);
    }
  }
  await check(root);
  assert.equal((await request("/_headers")).status, 404, "Cloudflare configuration is not a public asset");
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
    assertNoEmoji(html);
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
