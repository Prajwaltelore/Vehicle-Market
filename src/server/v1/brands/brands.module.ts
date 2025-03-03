import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Categories, CategoriesSchema } from '../../../common/schemas/categories.schema';
import { JwtStrategy } from '../../../common/jwt.strategy';
import { StorageService } from '../../../common/storage/storage.service';
import { BlacklistedToken, BlacklistedTokenSchema } from '../../../common/schemas/blacklistedtoken.schema';
import { Users, UsersSchema } from '../../../common/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { Brands, BrandsSchema } from '../../../common/schemas/brands.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Brands.name, schema: BrandsSchema },
      { name: Categories.name, schema: CategoriesSchema },
      { name: Users.name, schema: UsersSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: { expiresIn: configService.get('jwt_expiry') },
      }),
    }),
  ],
  controllers: [BrandsController],
  providers: [BrandsService, JwtStrategy, UsersService, StorageService],
})
export class BrandsModule {}
