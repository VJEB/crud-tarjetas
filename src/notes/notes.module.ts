import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { MovementLoggerService } from '../logger/movement-logger.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService, MovementLoggerService],
})
export class NotesModule {}
