import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Vercel-də /tmp qovluğu yazmaq üçün açıqdır
  const uploadPath = process.env.VERCEL ? join('/tmp', 'uploads') : join(process.cwd(), 'uploads');

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  // Yüklənmiş şəkilləri statik fayl kimi serve et
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads',
  });

  await app.init();

  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

// Development mode listener
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(app => {
    const port = process.env.PORT || 8002;
    app.listen(port, () => {
      console.log(`Application is running on: http://localhost:${port}`);
    });
  });
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};
