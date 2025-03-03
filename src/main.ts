import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';

async function bootstrap() {

  const config = new DocumentBuilder()
    .setTitle('REST ENDPOINTS - VEHICLES MARKET')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your Bearer token',
      },
      'JWT', // This is the name of the security scheme
    )
    .addSecurityRequirements('bearer')
    .build();

  const app = await NestFactory.create(AppModule, { cors: true });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document, {});
  app.useLogger(new Logger());
  app.use(helmet());
  app.use(bodyParser.json({ limit: '10mb' })); 
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); 

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });
}

bootstrap();
