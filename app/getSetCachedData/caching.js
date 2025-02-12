import redis from "../redis/rd";


export async function getCachedData(key, fetchFunction, ttl) {
  const timerName = `${key}`; // Unikátní název pro časovač
  console.time(timerName); // Začátek měření času
    
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

  console.timeEnd(timerName); // Konec měření času
  return result;
}
