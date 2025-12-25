export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.details
      ? `${errorData.error}: ${errorData.details}`
      : errorData.error;
    throw new Error(
      `API call failed: ${response.statusText}, ${errorMessage}`,
    );
  }

  return await response.json();
}
