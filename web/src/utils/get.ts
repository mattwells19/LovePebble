export async function get<ResponseType>(endpoint: string): Promise<ResponseType> {
  return fetch(endpoint).then(async (res) => {
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
