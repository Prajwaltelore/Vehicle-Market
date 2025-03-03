import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Categories, CategoriesSchema } from '../../../common/schemas/categories.schema';
import { JwtStrategy } from '../../../common/jwt.strategy';
import { StorageService } from '../../../common/storage/storage.service';
import { BlacklistedToken, BlacklistedTokenSchema } from 'src/common/schemas/blacklistedtoken.schema';
import { Users, UsersSchema } from 'src/common/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { BrandsService } from '../brands/brands.service';
import { Brands, BrandsSchema } from '../../../common/schemas/brands.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
      { name: Users.name, schema: UsersSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
      { name: Brands.name, schema: BrandsSchema },
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
  controllers: [CategoriesController],
  providers: [CategoriesService, JwtStrategy, UsersService, BrandsService, StorageService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
