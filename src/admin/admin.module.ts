import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtStrategy } from 'src/common/jwt.strategy';
import { StorageService } from 'src/common/storage/storage.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Classifieds, ClassifiedsSchema } from 'src/common/schemas/classifieds.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from 'src/common/schemas/blacklistedtoken.schema';
import { Users, UsersSchema } from 'src/common/schemas/users.schema';
import { UsersService } from 'src/server/v1/users/users.service';
import { Brands, BrandsSchema } from 'src/common/schemas/brands.schema';
import { Categories, CategoriesSchema } from 'src/common/schemas/categories.schema';
import { ClassifiedsService } from 'src/server/v1/classifieds/classifieds.service';
import { Countries, CountriesSchema } from 'src/common/schemas/countries.schema';
import { States, StatesSchema } from 'src/common/schemas/states.schema';
import { Cities, CitiesSchema } from 'src/common/schemas/cities.schema';
import { CategoriesService } from 'src/server/v1/categories/categories.service';
import { BrandsService } from 'src/server/v1/brands/brands.service';
import { Packages, PackagesSchema } from 'src/common/schemas/packages.schema';
import { Blogs, BlogsSchema } from 'src/common/schemas/blogs.schema';
import { NotificationsModule } from 'src/common/notifications/notifications.module';

@Module({
   imports: [
      ConfigModule,
      MongooseModule.forFeature([
        { name: Users.name, schema: UsersSchema },
        { name: Classifieds.name, schema: ClassifiedsSchema },
        { name: Brands.name, schema: BrandsSchema },
        { name: Packages.name, schema: PackagesSchema},
        { name: Blogs.name, schema: BlogsSchema},
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
    controllers: [AdminController],
    providers: [AdminService, StorageService, UsersService,ClassifiedsService,CategoriesService,BrandsService, JwtStrategy],
})
export class AdminModule {}
