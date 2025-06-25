import {
  BadRequestException,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { UsersRepository } from '../../users/repositories/users.repository';
import { LoggedInUser } from '../dto/create-auth.dto';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Middleware to authenticate users based on JWT token.
   * Extracts the JWT token from the Authorization header, verifies it,
   * and attaches the authenticated user to the request object.
   *
   *
   * @param {Request} req - The incoming HTTP request.
   * @param {Response} res - The outgoing HTTP response.
   * @param {NextFunction} next - The next middleware or controller in the pipeline.
   * @throws {UnauthorizedException} If the JWT token is invalid or user is not found.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    const logger = new Logger('AuthenticationMiddleware');

    // Ensure the Authorization header is present
    if (!authHeader) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Extract the Bearer token from the Authorization header
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    try {
      // Verify the JWT token using the secret
      const decodedUser = await this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });
      // Define the filters for querying the user
      const filters = {
        _id: decodedUser.userId,
      };
      // Find the user using the constructed filters
      const existingUser = (await this.usersRepository.findOne(
        filters,
      )) as LoggedInUser;
      // If user is not found, throw an unauthorized exception
      if (!existingUser) {
        throw new UnauthorizedException('Unauthorized');
      }
      existingUser.currentUserId = existingUser._id as string;
      req.user = existingUser;

      // Continue to the next middleware or controller
      next();
    } catch (error) {
      logger.error(error);
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Session expired. Please log in again.');
      }
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
