import redis from "../redis/rd";

export async function getCachedData(key, fetchFunction, ttl) {
  const cachedData = await redis.get(key);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // Pokud není v cache, zavolá fetchFunction
  const data = await fetchFunction();
  await redis.setex(key, ttl, JSON.stringify(data)); // Uloží do cache s TTL
  return data;
}