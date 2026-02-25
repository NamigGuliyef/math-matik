import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors(); // Enable CORS for frontend

  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 8002;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }

  return app.getHttpAdapter().getInstance();
}

export default bootstrap();
