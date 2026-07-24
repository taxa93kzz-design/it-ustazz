export function getSafeOrigin(requestUrl: string) {
  const incoming = new URL(requestUrl);
  if (["localhost", "127.0.0.1"].includes(incoming.hostname)) return incoming.origin;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return `https://${productionHost}`;
  return incoming.origin;
}
