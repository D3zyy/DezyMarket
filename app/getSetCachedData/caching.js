import redis from "../redis/rd";

export async function getCachedData(key, fetchFunction, ttl) {
  const cachedData = await redis.get(key);

  if (cachedData) {
    console.log("CACHE HIT")
    return JSON.parse(cachedData);
  }
  console.log("CACHE MISS")
  // Pokud není v cache, zavolá fetchFunction
  const data = await fetchFunction();
  await redis.setex(key, ttl, JSON.stringify(data)); // Uloží do cache s TTL
  return data;
}