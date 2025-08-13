// src/utils/swrFetchers.ts
export interface APIError extends Error {
  info?: any;
  status?: number;
}

const BASE_URL = "http://localhost:8787/api";

// 🔹 Shared error handler
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: APIError = new Error("API request failed");
    try {
      error.info = await response.json();
    } catch {
      error.info = null;
    }
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

/**
 * 🔹 GET fetcher - auto type infer via generic usage
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(res);
};

/**
 * 🔹 Mutation fetcher - all methods except GET
 */
export interface MutationOptions<TBody = unknown> {
  method?: Exclude<Uppercase<string>, "GET">;
  body?: TBody;
  headers?: Record<string, string>;
  [key: string]: any; // extra fetch() config if needed
}

export const mutationFetcher = async <TResponse = unknown, TBody = unknown>(
  url: string,
  { arg }: { arg: MutationOptions<TBody> },
): Promise<TResponse> => {
  const { method = "POST", body, headers = {}, ...rest } = arg || {};
  if (method.toUpperCase() === "GET") {
    throw new Error(
      "mutationFetcher does not support GET requests; use fetcher instead.",
    );
  }
  const res = await fetch(`${BASE_URL}${url}`, {
    method: method.toUpperCase(),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  return handleResponse<TResponse>(res);
};
