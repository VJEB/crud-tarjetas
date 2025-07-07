// src/notes/notes.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'The note has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes' })
  @ApiResponse({ status: 200, description: 'Return all notes.' })
  findAll() {
    return this.notesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by id' })
  @ApiResponse({ status: 200, description: 'Return the note.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'The note has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(+id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'The note has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  remove(@Param('id') id: string) {
    return this.notesService.remove(+id);
  }
}