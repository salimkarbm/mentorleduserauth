import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class GetPostDto {
  @ApiProperty({
    description: 'The MongoDB ID of the Post',
    type: String,
  })
  @IsMongoId({ message: 'invalid data provided' })
  postId: string;
}
