import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule, HttpService } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from '../../../common/schemas/users.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from '../../../common/schemas/blacklistedtoken.schema';
import { JwtStrategy } from '../../../common/jwt.strategy';
import { NotificationsModule } from '../../../common/notifications/notifications.module';
import { Images, ImagesSchema } from 'src/common/schemas/images.schema';
import { StorageService } from 'src/common/storage/storage.service';
@Module({
    imports: [
        ConfigModule,
        PassportModule,
        HttpModule,
        MongooseModule.forFeature([
            { name: Users.name, schema: UsersSchema },
            { name: Images.name, schema: ImagesSchema},
            { name: BlacklistedToken.name, schema: BlacklistedTokenSchema }
        ]), // Import User model
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('jwt_secret'),
                signOptions: { expiresIn: configService.get('jwt_expiry') },
            }),
        }),
        NotificationsModule
    ],
    providers: [UsersService,StorageService, JwtStrategy],
    controllers: [UsersController],
    exports: [UsersService], // Ensure the service is exported if needed in other modules
})
export class UsersModule { }
