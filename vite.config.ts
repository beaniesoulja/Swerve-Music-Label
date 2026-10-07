import vinext from "vinext";
import { defineConfig } from "vite";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  // Newsletter storage uses Neon PostgreSQL, not a Cloudflare D1 binding.
  d1_databases: [],
  r2_buckets: [],
};

// Vercel (and other Nitro-supported hosts) build with `VINEXT_TARGET=vercel`
// set, skipping the Cloudflare-only plugin and its D1/R2 bindings.
const useNitro = process.env.VINEXT_TARGET === "vercel" || Boolean(process.env.VERCEL);

export default defineConfig(async () => {
  if (useNitro) {
    const { nitro } = await import("nitro/vite");
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    return {
      plugins: [vinext(), tailwindcss(), nitro()],
    };
  }

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
