import Redis from 'ioredis';

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// OTP storage functions
export const OTP_PREFIX = 'otp:';
export const OTP_EXPIRY = 300; // 5 minutes in seconds

export async function storeOTP(phoneNumber: string, otp: string): Promise<void> {
  const key = `${OTP_PREFIX}${phoneNumber}`;
  await redis.setex(key, OTP_EXPIRY, otp);
}

export async function getOTP(phoneNumber: string): Promise<string | null> {
  const key = `${OTP_PREFIX}${phoneNumber}`;
  const otp = await redis.get(key);
  return otp;
}

export async function verifyAndDeleteOTP(phoneNumber: string, otp: string): Promise<boolean> {
  const key = `${OTP_PREFIX}${phoneNumber}`;
  const storedOTP = await redis.get(key);

  if (storedOTP === otp) {
    await redis.del(key);
    return true;
  }

  return false;
}

export async function isRateLimited(phoneNumber: string): Promise<boolean> {
  const key = `rate_limit:${phoneNumber}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    // Set expiry for 1 hour (3600 seconds)
    await redis.expire(key, 3600);
  }

  // Allow max 10 OTP requests per hour
  return attempts > 10;
}
