/** Shared checks for both newsletter entry points so a policy change lands once. */
export function crossSiteRequest(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== new URL(request.url).origin);
}

export function hasContentType(request: Request, type: "application/json" | "application/x-www-form-urlencoded") {
  return Boolean(request.headers.get("content-type")?.includes(type));
}
