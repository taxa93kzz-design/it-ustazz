export class AiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function requestAi<T>(url: string, input: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new AiRequestError(data.error || "AI сұрауы орындалмады", response.status);
  }
  return data;
}
