const buckets = new Map<string, { tokens: number; lastRefillMs: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, lastRefillMs: now };
  // Refill
  const elapsed = now - bucket.lastRefillMs;
  if (elapsed > windowMs) {
    bucket.tokens = limit;
    bucket.lastRefillMs = now;
  }
  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}


