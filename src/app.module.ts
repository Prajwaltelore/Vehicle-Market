import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { V1Module } from './server/v1/v1.module';
import { NotificationsModule } from './common/notifications/notifications.module';
import { MulterModule } from '@nestjs/platform-express';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database')
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, 
    }),
    V1Module,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
