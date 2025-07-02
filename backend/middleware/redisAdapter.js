// Redis adapter for rate limiting
// Bu dosya Redis kullanımı için hazır, şimdilik memory store kullanıyor

class MemoryStore {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const data = this.store.get(key);
    if (!data) return null;
    
    // TTL kontrolü
    if (data.expireAt && Date.now() > data.expireAt) {
      this.store.delete(key);
      return null;
    }
    
    return data.value;
  }

  async set(key, value, ttlSeconds) {
    const expireAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    
    this.store.set(key, {
      value,
      expireAt
    });
    
    return true;
  }

  async del(key) {
    return this.store.delete(key);
  }

  async exists(key) {
    const exists = this.store.has(key);
    if (!exists) return false;
    
    // TTL kontrolü
    const data = this.store.get(key);
    if (data.expireAt && Date.now() > data.expireAt) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  async incr(key, ttlSeconds = null) {
    const current = await this.get(key);
    const newValue = (current || 0) + 1;
    await this.set(key, newValue, ttlSeconds);
    return newValue;
  }

  // Temizlik işlemi
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.expireAt && now > data.expireAt) {
        this.store.delete(key);
      }
    }
  }
}

class RedisStore {
  constructor(redisClient) {
    this.client = redisClient;
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds) {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async incr(key, ttlSeconds = null) {
    try {
      const value = await this.client.incr(key);
      if (ttlSeconds && value === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 1;
    }
  }
}

// Store factory
export const createStore = () => {
  if (process.env.REDIS_URL) {
    try {
      // Redis istemcisi burada oluşturulacak
      // const redis = require('redis');
      // const client = redis.createClient(process.env.REDIS_URL);
      // return new RedisStore(client);
      
      console.log('Redis URL detected but Redis client not implemented yet. Using memory store.');
    } catch (error) {
      console.error('Redis connection failed, falling back to memory store:', error);
    }
  }
  
  const memoryStore = new MemoryStore();
  
  // Memory store için periyodik temizlik
  setInterval(() => {
    memoryStore.cleanup();
  }, 5 * 60 * 1000); // 5 dakikada bir
  
  return memoryStore;
};

export default createStore; 