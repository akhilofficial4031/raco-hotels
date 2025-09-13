// src/utils/swrFetchers.ts
export interface APIError extends Error {
  info?: any;
  status?: number;
}

export const BASE_URL = import.meta.env.VITE_API_URL;

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

    // Handle unauthorized responses
    // if (response.status === 401) {
    //   // Clear stored auth data
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("token");

    //   // Only redirect if we're not already on the login page
    //   if (window.location.pathname !== "/login") {
    //     window.location.href = "/login";
    //   }
    // }

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
