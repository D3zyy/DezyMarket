import redis from "../redis/rd";

export async function getCachedData(key, fetchFunction, ttl) {
  const timerName = `${key}`; // Unikátní název pro časovač
  console.time(timerName); // Začátek měření času
    
  const cachedData = await redis.get(key);
  let result;

  if (cachedData) {

    result = JSON.parse(cachedData);
  } else {

    // Pokud není v cache, zavolá fetchFunction
    result = await fetchFunction();
    await redis.setex(key, ttl, JSON.stringify(result)); // Uloží do cache s TTL
  }

  console.timeEnd(timerName); // Konec měření času
  return result;
}

export async function invalidateCache(key) {
  try {
    const deleted = await redis.del(key);
    if (deleted) {
      console.log(`Cache key '${key}' invalidated.`);
    } else {
      console.log(`Cache key '${key}' not found.`);
    }
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
}
