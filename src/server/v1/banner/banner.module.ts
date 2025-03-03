import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from 'src/common/schemas/banner.schema';
import { BannerController } from './banner.controller';
import { StorageService } from 'src/common/storage/storage.service';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Banner.name, schema: BannerSchema },
      ]),
    ],
    controllers: [BannerController],
    providers: [BannerService, StorageService],
    exports: [BannerService]
})
export class BannerModule {}
