import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { connectToDb } from './dbConnection/connectToDb';
import * as cookieParser from 'cookie-parser';
import { CustomExceptionFilter } from './all-ExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const dbUri = configService.get<string>('DB_URI');
  const clientUrl = configService.get<string>('CLIENT_URL');

  app.use(cookieParser());
  app.enableCors({
    origin: clientUrl,
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(port);
  await connectToDb(dbUri);
  console.log(`App is listening on port:${port}`);
}
bootstrap();
