import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/common/constant';
import { HttpResponse } from 'src/utils';
import { Response } from 'express';
import {
  AuthUserLoginRequestBody,
  AuthUserRequestBody,
} from 'src/types/user.type';

@Controller('v1/auth')
@ApiTags('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
  })
  @ApiBadRequestResponse({
    description: ERROR_MESSAGES.USER_ALREADY_REGISTERED,
  })
  /**
   * Register a new user by generating an OTP and sending it to the specified phone number.
   * If the OTP is valid and the phone number is not already in use, creates a new user with the
   * provided information and returns the access token.
   * @param createUserDto - The data required to create a new user.
   * @returns A promise that resolves to an object containing the access token.
   * @throws HttpException if the user is already registered or if an OTP request is made too soon.
   */
  async register(
    @Res() response: Response,
    @Body() createUserDto: AuthUserRequestBody,
  ) {
    const result = await this.authService.registerUser(createUserDto);
    return HttpResponse({
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
      data: result,
      status: HttpStatus.CREATED,
      response,
    });
  }

  /**
   * Logs in a user by verifying their credentials and generating an access token.
   * @param loginUserDto - The credentials of the user attempting to log in.
   * @returns A promise that resolves to an object containing the user information and access token.
   * @throws HttpException if the user is not found or if the credentials are invalid.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.INVALID_CREDENTIALS })
  async login(
    @Body() loginUserDto: AuthUserLoginRequestBody,
    @Res() response: Response,
  ) {
    const result = await this.authService.loginUser(loginUserDto);
    return HttpResponse({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }
}
