import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Packages, PackagesSchema } from '../../../common/schemas/packages.schema';
import { Users, UsersSchema } from '../../../common/schemas/users.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from '../../../common/schemas/blacklistedtoken.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Packages.name, schema: PackagesSchema },
      { name: Users.name, schema: UsersSchema },
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
    ])
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService]
})
export class PackagesModule { }
