export function getSafeOrigin(requestUrl: string) {
  const incoming = new URL(requestUrl);
  if (["localhost", "127.0.0.1"].includes(incoming.hostname)) return incoming.origin;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("Жетіспейтін environment variable: NEXT_PUBLIC_SITE_URL");
  const configured = new URL(siteUrl);
  if (!["http:", "https:"].includes(configured.protocol)) {
    throw new Error("NEXT_PUBLIC_SITE_URL http немесе https адресі болуы керек");
  }
  return configured.origin;
}
