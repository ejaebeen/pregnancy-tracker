const BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get = <T>(p: string) => request<T>(p);
export const post = <T>(p: string, body: unknown) =>
  request<T>(p, { method: "POST", body: JSON.stringify(body) });
export const patch = <T>(p: string, body: unknown) =>
  request<T>(p, { method: "PATCH", body: JSON.stringify(body) });
export const del = (p: string) => request<void>(p, { method: "DELETE" });
