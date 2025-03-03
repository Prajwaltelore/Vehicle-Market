import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from 'src/common/schemas/users.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../common/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocationsModule } from './locations/locations.module';
import { ClassifiedsModule } from './classifieds/classifieds.module';
import { BlacklistedToken, BlacklistedTokenSchema } from 'src/common/schemas/blacklistedtoken.schema';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { BlogsModule } from './blogs/blogs.module';
import { StorageService } from '../../common/storage/storage.service';
import { PackagesModule } from './packages/packages.module';
import { Brands, BrandsSchema } from '../../common/schemas/brands.schema';
import { Categories, CategoriesSchema } from '../../common/schemas/categories.schema';
import { Blogs, BlogsSchema } from '../../common/schemas/blogs.schema';
import { Packages, PackagesSchema } from '../../common/schemas/packages.schema';
import { Countries, CountriesSchema } from 'src/common/schemas/countries.schema';
import { Cities, CitiesSchema } from 'src/common/schemas/cities.schema';
import { States, StatesSchema } from 'src/common/schemas/states.schema';
import { BannerController } from './banner/banner.controller';
import { BannerModule } from './banner/banner.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
      { name: Categories.name, schema: CategoriesSchema },
      { name: Brands.name, schema: BrandsSchema },
      { name: Blogs.name, schema: BlogsSchema },
      { name: Packages.name, schema: PackagesSchema },
      { name: Countries.name, schema: CountriesSchema },
      { name: States.name, schema: StatesSchema },
      { name: Cities.name, schema: CitiesSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: { expiresIn: configService.get('jwt_expiry') },
      }),
    }),
    UsersModule,
    AuthModule,
    LocationsModule,
    ClassifiedsModule,
    CategoriesModule,
    BrandsModule,
    BlogsModule,
    PackagesModule,
    BannerModule,
    AdminModule
  ],
  providers: [UsersService, StorageService, JwtStrategy],
  exports: [UsersService],
})
export class V1Module { }
