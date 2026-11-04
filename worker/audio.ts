/** Static Assets ignores Range; previews need partial responses for seeking. */
export async function audioResponse(request: Request, assets: { fetch(request: Request): Promise<Response> }) {
  const assetRequest = new Request(request, { method: "GET" });
  assetRequest.headers.delete("Range");
  assetRequest.headers.delete("If-Range");
  const asset = await assets.fetch(assetRequest);
  if (asset.status !== 200 && asset.status !== 304) return asset;
  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  if (asset.status === 304) return new Response(null, { status: 304, headers });
  // shortcut: buffer only these small 30-second previews; use R2 for full-length media.
  const bytes = await asset.arrayBuffer();
  const size = bytes.byteLength;
  headers.set("Content-Length", String(size));
  const range = request.headers.get("Range")?.match(/^bytes=(\d*)-(\d*)$/);
  const ifRange = request.headers.get("If-Range");
  if (request.method !== "GET" || !range || (!range[1] && !range[2]) ||
      (ifRange && ifRange !== headers.get("ETag") && ifRange !== headers.get("Last-Modified"))) {
    return new Response(request.method === "HEAD" ? null : bytes, { status: 200, headers });
  }

  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, { status: 416, headers });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(bytes.slice(start, end + 1), { status: 206, headers });
}
