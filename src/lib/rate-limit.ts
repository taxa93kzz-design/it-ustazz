const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  if (current.count > 5) return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  return { allowed: true, retryAfter: 0 };
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}

const chatRequests = new Map<string, { count: number; resetAt: number }>();

export function checkChatRateLimit(userId: string) {
  const now = Date.now();
  const current = chatRequests.get(userId);
  if (!current || current.resetAt <= now) {
    chatRequests.set(userId, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return current.count <= 20
    ? { allowed: true, retryAfter: 0 }
    : { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}
