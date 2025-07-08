import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PoolConnection } from 'mysql2/promise';
import { MovementLoggerService } from '../logger/movement-logger.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

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
    const userId = this.req.user?.userId;
    if (!userId) throw new Error('User not authenticated');

    const [notes]: any[] = await this.connection.query(
      'SELECT * FROM notes WHERE user_id = ?',
      [userId]
    );

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
    const userId = this.req.user?.userId;
    if (!userId) throw new Error('User not authenticated');

    const [rows]: any[] = await this.connection.query(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId],
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

  async create(dto: CreateNoteDto) {
    console.log(JSON.stringify({
      method: this.req.method,
      url: this.req.url,
      headers: this.req.headers,
      body: this.req.body,
      user: this.req.user,
      params: this.req.params,
      query: this.req.query,
    }, null, 2));
    
    const userId = this.req.user?.userId;
    if (!userId) throw new Error('User not authenticated');
    
    const { title, contents = [] } = dto;

    const [result]: any = await this.connection.query(
      'INSERT INTO notes (title, user_id) VALUES (?, ?)',
      [title, userId],
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

  async update(id: number, dto: UpdateNoteDto) {
    const userId = this.req.user?.userId;
    if (!userId) throw new Error('User not authenticated');

    // First verify the note belongs to the user
    const [existingNote]: any[] = await this.connection.query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!existingNote.length) {
      throw new Error('Note not found or access denied');
    }

    const { title, contents = [] } = dto;

    await this.connection.query(
      'UPDATE notes SET title = ? WHERE id = ? AND user_id = ?',
      [title, id, userId]
    );

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
    const userId = this.req.user?.userId;
    if (!userId) throw new Error('User not authenticated');

    // First verify the note belongs to the user
    const [existingNote]: any[] = await this.connection.query(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!existingNote.length) {
      throw new Error('Note not found or access denied');
    }

    await this.connection.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    await this.connection.query('DELETE FROM note_contents WHERE note_id = ?', [id]);
    
    // Log the deletion
    this.movementLogger.logMovement('delete', existingNote[0]);
    
    return { message: 'Note deleted successfully' };
  }
}
