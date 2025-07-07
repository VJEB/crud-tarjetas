import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The title of the note',
    example: 'Shopping List',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Array of note contents',
    example: ['Milk', 'Eggs', 'Bread'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contents?: string[];
}