import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
export class CreatePostDto {
  @ApiProperty({
    description: 'this is required, if you want to add title',
    example: 'tech',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'this is required, if you want to add content',
    example: 'what is tech',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'this is optional, if you want to add tags',
    example: ['tech', 'news'],
    required: false,
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'this is optional, if you want to add cover image. The file to be uploaded (e.g., PNG or JPG)',
    required: false,
    example: 'image.png',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;
}
