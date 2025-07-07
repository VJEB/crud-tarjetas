import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool, PoolOptions, PoolConnection } from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const config: PoolOptions = {
      host: process.env.DB_HOST ?? 'localhost',
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'password',
      database: process.env.DB_NAME ?? 'crud_tarjetas',
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    };
    this.pool = createPool(config);
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
