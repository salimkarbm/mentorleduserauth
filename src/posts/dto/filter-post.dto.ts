import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';
export class FilterPostDto {
  @ApiProperty({
    description: 'The current page number for pagination',
    type: Number,
    example: 1,
    default: 1,
  })
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'The number of items to return per page',
    type: Number,
    example: 10,
    default: 10,
  })
  @IsNumberString()
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;
}
