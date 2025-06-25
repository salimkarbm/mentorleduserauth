import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/common/decorator/user.decorator';
import { LoggedInUser } from 'src/auth/dto/create-auth.dto';
import { Response } from 'express';
import { HttpResponse } from 'src/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/common/constant';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@Controller('v1/users')
@ApiTags('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  @ApiOperation({ summary: 'View user profile' })
  @ApiBearerAuth() // This indicates that the endpoint requires a Bearer token
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.USER_PROFILE_FETCHED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.UNAUTHORIZED })
  async viewProfile(@Res() response: Response, @GetUser() user: LoggedInUser) {
    const result = await this.usersService.userProfile(user);
    return HttpResponse({
      message: SUCCESS_MESSAGES.USER_PROFILE_FETCHED,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }
}
