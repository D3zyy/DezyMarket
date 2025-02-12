import redis from "../redis/rd";

export async function checkRateLimit(ip) {
  if (!ip) return { allowed: false, error: "IP adresa nenalezena" };

  const limit = 20; // Maximálně 60 požadavků
  const duration = 10; // Trvání rate limitu (60 sekund)

  const key = `rate_limit:${ip}`;
  const requests = await redis.incr(key);

  if (requests === 1) {
    await redis.expire(key, duration); 
  }

  if (requests > limit) {
    return { allowed: false, error: "Příliš mnoho požadavků, zkuste to znovu za chvíli." };
  }

  return { allowed: true };
}