/**
 * Call Supabase Edge Functions from the Next.js app.
 * Uses anon key or user JWT for auth.
 */

const getUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function invokeEdgeFunction<T = unknown>(
  name: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: Record<string, unknown>;
    query?: Record<string, string>;
    token?: string | null;
  } = {}
): Promise<{ data?: T; error?: { message: string } }> {
  const { method = "POST", body, query, token } = options;
  const base = `${getUrl()}/functions/v1/${name}`;
  const url = new URL(base);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : `Bearer ${getAnonKey()}`,
  };
  const res = await fetch(url.toString(), {
    method,
    headers,
    ...(body && method !== "GET" ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data: T | undefined;
  let error: { message: string } | undefined;
  try {
    const parsed = text ? JSON.parse(text) : {};
    if (res.ok) {
      data = parsed as T;
    } else {
      error = { message: parsed.message ?? parsed.error ?? res.statusText };
    }
  } catch {
    error = { message: res.ok ? "Invalid JSON" : res.statusText };
  }
  return { data, error };
}
