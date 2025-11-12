import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = parseInt(process.env.PORT || '3000'); // Render PORT environment variable
  await app.listen(PORT, '0.0.0.0');
  console.log(`Server listening on port ${PORT}`);
}
bootstrap();
