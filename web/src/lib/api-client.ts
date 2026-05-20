import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_BASE_URL =
  configuredApiBaseUrl === undefined ? "http://localhost:8080" : configuredApiBaseUrl.replace(/\/$/, "");

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore if response body parsing fails
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
