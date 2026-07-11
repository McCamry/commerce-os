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
  // NOTE: most DTOs are plain classes without class-validator decorators, so
  // `whitelist: true` would strip every field. Keep it off until DTOs are
  // annotated; `transform` still coerces bodies into DTO instances.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
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
