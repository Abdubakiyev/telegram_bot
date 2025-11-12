import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Render avtomatik PORT beradi, default 3000 ishlatiladi agar $PORT topilmasa
  const PORT = parseInt(process.env.PORT || '3000');

  await app.listen(PORT, '0.0.0.0');
  console.log(`Server listening on port ${PORT}`);
}

bootstrap();
