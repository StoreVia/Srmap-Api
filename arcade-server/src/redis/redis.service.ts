import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private memoryStore = new Map<string, string>();
  private isConnected = false;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    try {
      this.client = redisUrl
        ? new Redis(redisUrl, { retryStrategy: () => null, maxRetriesPerRequest: 1 })
        : new Redis({
            host: redisHost,
            port: redisPort,
            retryStrategy: () => null,
            maxRetriesPerRequest: 1,
            lazyConnect: true,
          });

      this.client.connect().then(() => {
        this.isConnected = true;
      }).catch(() => {
        this.isConnected = false;
      });

      this.client.on('error', () => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        this.isConnected = false;
      }
    }
    this.memoryStore.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        this.isConnected = false;
      }
    }
    return this.memoryStore.get(key) || null;
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        this.isConnected = false;
      }
    }
    this.memoryStore.delete(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
    }
  }
}