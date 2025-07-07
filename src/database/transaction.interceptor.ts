import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Observable, firstValueFrom, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PoolConnection } from 'mysql2/promise';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly db: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest();

    return from(this.db.getConnection()).pipe(
      switchMap(async (connection: PoolConnection) => {
        try {
          await connection.beginTransaction();
          request.dbConn = connection;
          const result = await firstValueFrom(next.handle());
          await connection.commit();
          return result;
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          request.dbConn = undefined;
          connection.release();
        }
      }),
    );
  }
}
