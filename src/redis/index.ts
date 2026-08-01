import { createClient } from 'redis';
import { env } from '../config/env.config.js';

export const publisher = createClient({ url: env.REDIS_URL });
export const subscriber = createClient({ url: env.REDIS_URL });

publisher.on('error', (err) => console.error('Redis publisher error:', err));
subscriber.on('error', (err) => console.error('Redis subscriber error:', err));

export async function connectRedis() {
    await publisher.connect();
    await subscriber.connect();
    console.log('Redis connected');
}
