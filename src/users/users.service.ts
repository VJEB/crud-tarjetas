import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PoolConnection } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
  ) {
  }

  private get connection(): PoolConnection {
    return this.req.dbConn;
  }

  async create(username: string, password: string) {
    // Check if user already exists
    const [existingUsers] = await this.connection.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const [result] = await this.connection.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    return { id: (result as any).insertId, username };
  }

  async findByUsername(username: string): Promise<any> {
    const [users] = await this.connection.query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new NotFoundException('User not found');
    }

    return users[0];
  }
}
