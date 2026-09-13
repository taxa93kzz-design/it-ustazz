export class AiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly whatsappUrl?: string,
  ) {
    super(message);
  }
}

export async function requestAi<T>(url: string, input: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as T & { error?: string; code?: string; whatsappUrl?: string };
  if (!response.ok) {
    if (data.code === "SUBSCRIPTION_REQUIRED") {
      window.dispatchEvent(new CustomEvent("subscription-required", { detail: data }));
    }
    throw new AiRequestError(data.error || "AI сұрауы орындалмады", response.status, data.code, data.whatsappUrl);
  }
  const remaining = response.headers.get("X-AI-Remaining");
  if (remaining !== null) window.dispatchEvent(new CustomEvent("ai-usage-updated", { detail: { remaining: Number(remaining) } }));
  return data;
}
