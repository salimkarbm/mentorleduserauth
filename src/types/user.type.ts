import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class IUser {
  @ApiProperty({ example: 'tech' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'salimimuzai@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssword' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class AuthUserRequestBody extends IUser {}

export class AuthUserLoginRequestBody {
  @ApiProperty({ example: 'salimimuzai@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssword' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
