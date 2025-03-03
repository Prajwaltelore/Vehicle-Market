import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../../common/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from '../../../common/schemas/users.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from '../../../common/schemas/blacklistedtoken.schema';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { NotificationsModule } from '../../../common/notifications/notifications.module';
import { Images, ImagesSchema } from 'src/common/schemas/images.schema';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { FacebookStrategy } from './utils/FacebookStrategy';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Images.name, schema: ImagesSchema},
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema }
    ]),
    ConfigModule,
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: { expiresIn: configService.get('jwt_expiry') },
      }),
    }),
    UsersModule,
    NotificationsModule
  ],
  providers: [AuthService, UsersService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
