import { mapErrorToHttp } from "@/lib/errors";
import { jsonResponse } from "./jsonResponse";

export async function handleRoute(
  run: () => Promise<Response>,
): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    const { status, message } = mapErrorToHttp(error);
    if (status >= 500) {
      console.error(error);
    }
    return jsonResponse({ error: message }, { status });
  }
}
