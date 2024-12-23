export function get<ResponseType>(
  endpoint: string,
  options?: RequestInit,
): Promise<ResponseType> {
  return fetch(endpoint, options).then(async (res) => {
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    const result = await res.text();

    if (result === "true" || result === "false") {
      return JSON.parse(result);
    } else {
      return result;
    }
  });
}
