import { Injectable, Logger } from '@nestjs/common';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MovementLoggerService extends Logger {
  private readonly logPath: string;

  constructor() {
    super('MovementLogger');
    const dir = join(process.cwd(), 'logs');
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
    this.logPath = join(dir, 'movements.log');
  }

  logMovement(action: string, payload: unknown) {
    const entry = `${new Date().toISOString()} | ${action} | ${JSON.stringify(
      payload,
    )}\n`;
    appendFileSync(this.logPath, entry, {
      encoding: 'utf8',
    });
    this.log(`${action} logged`);
  }
}
