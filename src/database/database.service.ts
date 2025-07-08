import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool, PoolOptions, PoolConnection } from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const config: PoolOptions = {
      host: process.env.DB_HOST ?? 'localhost',
      user: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? 'jafet10espinoza',
      database: process.env.DB_DATABASE ?? 'crud_tarjetas',
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    };
    try {
      this.pool = createPool(config);
    } catch (error) {
      console.error('DatabaseService initialization failed:', error);
      throw error;
    }
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
