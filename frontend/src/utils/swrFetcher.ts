// src/utils/swrFetchers.ts
export interface APIError extends Error {
  info?: any;
  status?: number;
}

export const BASE_URL = import.meta.env.VITE_API_URL;

// 🔹 Shared error handler
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "API request failed";
    let errorInfo: any = null;
    try {
      const body = await response.json();
      errorInfo = body;
      if (body && body.error && typeof body.error.message === "string") {
        errorMessage = body.error.message;
      } else if (body && typeof body.message === "string") {
        errorMessage = body.message;
      }
    } catch {
      // JSON parsing failed or no body
    }
    const error: APIError = new Error(errorMessage);
    error.info = errorInfo;
    error.status = response.status;

    // Handle unauthorized responses
    if (response.status === 401) {
      // Dispatch a custom event that AuthContext can listen to
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    throw error;
  }
  return response.json() as Promise<T>;
}

/**
 * 🔹 GET fetcher - auto type infer via generic usage
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  // Get CSRF token from cookie or use a hardcoded one for testing
  const csrfToken =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1] || "";

  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
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

  // Get CSRF token from cookie
  const csrfToken =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1] || "";

  const res = await fetch(`${BASE_URL}${url}`, {
    method: method.toUpperCase(),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  return handleResponse<TResponse>(res);
};

/**
 * 🔹 Multipart form fetcher for file uploads
 */
export interface MultipartMutationOptions {
  method?: Exclude<Uppercase<string>, "GET">;
  formData: FormData;
  headers?: Record<string, string>;
  [key: string]: any;
}

export const multipartMutationFetcher = async <TResponse = unknown>(
  url: string,
  { arg }: { arg: MultipartMutationOptions },
): Promise<TResponse> => {
  const { method = "POST", formData, headers = {}, ...rest } = arg || {};
  if (method.toUpperCase() === "GET") {
    throw new Error(
      "multipartMutationFetcher does not support GET requests; use fetcher instead.",
    );
  }

  // Get CSRF token from cookie
  const csrfToken =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1] || "";

  const res = await fetch(`${BASE_URL}${url}`, {
    method: method.toUpperCase(),
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
      ...headers,
    },
    body: formData,
    ...rest,
  });
  return handleResponse<TResponse>(res);
};
