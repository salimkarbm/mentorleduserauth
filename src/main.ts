import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionsFilter } from './common/exceptions/exception.handler';
import { ConfigService } from '@nestjs/config';
import * as hpp from 'hpp';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Set security HTTP headers
  app.use([hpp(), compression(), helmet()]);

  app.enableCors();

  app.useGlobalFilters(new ExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mentorled API')
    .setDescription(
      'This API is used for User Authentication System.\n\n📘 [GitHub Repository](https://github.com/yourusername/your-repo-name)\n\n🔗 [Swagger UI](https://yourdomain.com/api-docs)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(configService.get<number>('PORT', 3000) ?? 3000);
}
bootstrap();
