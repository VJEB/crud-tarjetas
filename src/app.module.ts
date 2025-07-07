import { Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { NotesModule } from './notes/notes.module';
import { TransactionInterceptor } from './database/transaction.interceptor';

@Module({
  imports: [DatabaseModule, NotesModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
