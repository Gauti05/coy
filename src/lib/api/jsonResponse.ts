/** JSON response with Cache-Control: no-store (feed/matches/swipe). */
export function jsonResponse(
  data: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(data, {
    ...init,
    headers,
  });
}
