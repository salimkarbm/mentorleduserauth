import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AuthUserLoginRequestBody,
  AuthUserRequestBody,
} from 'src/types/user.type';
import { hashPassword } from 'src/utils';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { ERROR_MESSAGES } from 'src/common/constant';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private createAccessToken(
    payload: Record<string, any>,
  ): string | Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<number | string>('jwt.expiresIn'),
    });
  }

  private createRefreshToken(
    payload: Record<string, any>,
  ): string | Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<number | string>(
        'jwt.refreshTokenExpiry',
      ),
    });
  }
  /**
   * Registers a new user after verifying their phone number and OTP.
   * @param createUserDto - The data required to create a new user.
   * @returns A promise that resolves to an object containing the access token.
   * @throws HttpException if the phone number is not verified or the OTP is invalid.
   */
  async registerUser(
    createUserDto: AuthUserRequestBody,
  ): Promise<{ accessToken: string }> {
    try {
      const isExist = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (isExist) {
        throw new HttpException(
          ERROR_MESSAGES.USER_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }
      let user = new this.userModel({
        ...createUserDto,
        password: await hashPassword(createUserDto.password),
      });

      user = await user.save();
      const accessToken = await this.createAccessToken({
        userId: user._id,
      });
      return {
        accessToken,
      };
    } catch (error) {
      throw new HttpException(
        error.code === 11000 ? ERROR_MESSAGES.USER_EXISTS : error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Logs in a user by verifying their credentials and generating an access token.
   * @param loginUserDto - The credentials of the user attempting to log in.
   * @returns A promise that resolves to an object containing the user information and access token.
   * @throws HttpException if the user is not found or if the credentials are invalid.
   */
  async loginUser(loginUserDto: AuthUserLoginRequestBody): Promise<{
    user?: Partial<User>;
    tokens?: { accessToken: string; refreshToken: string };
  }> {
    const userRecord = (
      await this.userModel.findOne(
        { email: loginUserDto.email },
        { password: 1, fullName: 1 },
      )
    )?.toJSON();
    if (!userRecord) {
      throw new HttpException(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      userRecord.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatus.BAD_REQUEST,
      );
    }
    // delete unused fields for now
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = userRecord;

    return {
      tokens: {
        accessToken: this.createAccessToken({
          userId: userRecord._id,
        }) as string,
        refreshToken: this.createRefreshToken({
          userId: userRecord._id,
        }) as string,
      },
      user: safeUser,
    };
  }
}
