import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import * as compressionPkg from 'compression';
const compression = compressionPkg.default || compressionPkg;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.use(helmet());
  app.use(compression());
  app.enableCors(); // Enables CORS with default settings

  // Global standardizations
  // All `@Body()` DTOs are decorated with class-validator, so `whitelist: true`
  // safely strips unknown properties. Nested item arrays use `@IsArray()` only
  // (no `@ValidateNested`), so whitelist does not recurse into them and their
  // payloads pass through intact. `transform` coerces bodies into DTO instances.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API Server running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
