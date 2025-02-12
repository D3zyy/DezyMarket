import redis from "../redis/rd";

export async function getCachedData(key, fetchFunction, ttl) {
  console.time("Cache Operation Duration"); // Začátek měření času

  const cachedData = await redis.get(key);
  let result;

  if (cachedData) {
    console.log("CACHE HIT");
    result = JSON.parse(cachedData);
  } else {
    console.log("CACHE MISS");
    // Pokud není v cache, zavolá fetchFunction
    result = await fetchFunction();
    await redis.setex(key, ttl, JSON.stringify(result)); // Uloží do cache s TTL
  }

  console.timeEnd("Cache Operation Duration"); // Konec měření času
  return result;
}