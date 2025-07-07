import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PoolConnection } from 'mysql2/promise';
import { MovementLoggerService } from '../logger/movement-logger.service';

@Injectable()
export class NotesService {
  constructor(
    @Inject(REQUEST) private readonly req: any,
    private readonly movementLogger: MovementLoggerService,
  ) {}

  private get connection(): PoolConnection {
    return this.req.dbConn;
  }

  async findAll() {
    const [notes]: any[] = await this.connection.query('SELECT * FROM notes');

    for (const note of notes) {
      const [contents] = await this.connection.query(
        'SELECT * FROM note_contents WHERE note_id = ?',
        [note.id],
      );
      note.contents = contents;
    }

    return notes;
  }

  async findOne(id: number) {
    const [rows]: any[] = await this.connection.query(
      'SELECT * FROM notes WHERE id = ?',
      [id],
    );
    const note = rows[0];
    if (!note) return null;

    const [contents] = await this.connection.query(
      'SELECT * FROM note_contents WHERE note_id = ?',
      [id],
    );
    note.contents = contents;
    return note;
  }

  async create(dto: any) {
    const { title, contents = [] } = dto;

    const [result]: any = await this.connection.query(
      'INSERT INTO notes (title) VALUES (?)',
      [title],
    );
    const noteId = result.insertId;

    if (Array.isArray(contents) && contents.length) {
      for (const content of contents) {
        await this.connection.query(
          'INSERT INTO note_contents (note_id, content) VALUES (?, ?)',
          [noteId, content],
        );
      }
    }

    const created = await this.findOne(noteId);
    this.movementLogger.logMovement('create', created);
    return created;
  }

  async update(id: number, dto: any) {
    const { title, contents } = dto;

    if (title !== undefined) {
      await this.connection.query('UPDATE notes SET title = ? WHERE id = ?', [title, id]);
    }

    if (Array.isArray(contents)) {
      await this.connection.query('DELETE FROM note_contents WHERE note_id = ?', [id]);
      for (const content of contents) {
        await this.connection.query(
          'INSERT INTO note_contents (note_id, content) VALUES (?, ?)',
          [id, content],
        );
      }
    }

    const updated = await this.findOne(id);
    this.movementLogger.logMovement('update', updated);
    return updated;
  }

  async remove(id: number) {
    await this.connection.query('DELETE FROM notes WHERE id = ?', [id]);
    this.movementLogger.logMovement('delete', { id });
    return { id };
  }
}
