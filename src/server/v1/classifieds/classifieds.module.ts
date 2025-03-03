import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassifiedsService } from './classifieds.service';
import { StorageService } from '../../../common/storage/storage.service';
import { ClassifiedsController } from './classifieds.controller';
import { Classifieds, ClassifiedsSchema } from '../../../common/schemas/classifieds.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { Users, UsersSchema } from '../../../common/schemas/users.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from '../../../common/schemas/blacklistedtoken.schema';
import { JwtStrategy } from '../../../common/jwt.strategy';
import { NotificationsModule } from '../../../common/notifications/notifications.module';
import { Brands, BrandsSchema } from '../../../common/schemas/brands.schema';
import {
  Countries,
  CountriesSchema,
} from '../../../common/schemas/countries.schema';
import { States, StatesSchema } from '../../../common/schemas/states.schema';
import { Cities, CitiesSchema } from '../../../common/schemas/cities.schema';
import { Categories, CategoriesSchema } from '../../../common/schemas/categories.schema';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Classifieds.name, schema: ClassifiedsSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Brands.name, schema: BrandsSchema },
      { name: Countries.name, schema: CountriesSchema },
      { name: States.name, schema: StatesSchema },
      { name: Cities.name, schema: CitiesSchema },
      { name: Categories.name, schema: CategoriesSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  controllers: [ClassifiedsController],
  providers: [ClassifiedsService, StorageService,CategoriesService,BrandsService, UsersService, JwtStrategy],
  exports: [ClassifiedsService], // Exporting in case other modules need to use ClassifiedsService
})
export class ClassifiedsModule {}
