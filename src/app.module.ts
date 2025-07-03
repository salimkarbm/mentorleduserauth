import {
  Logger,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config';
import { AuthenticationMiddleware } from './auth/middlewares/authentication.middleware';
import { DatabaseModule } from './database/database.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude({ path: 'v1/auth/{*auth}', method: RequestMethod.ALL })
      .forRoutes('{*auth}');
  }
  onModuleInit() {
    // Log a message when the server has started
    const port = process.env.PORT || 3000;

    this.logger.log(`

    Server is running on http://localhost:${port}
    `);
  }
}
