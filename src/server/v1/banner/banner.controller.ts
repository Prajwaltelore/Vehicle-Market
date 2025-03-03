import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { StorageService } from 'src/common/storage/storage.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Banner Controller')
@Controller('v1/banners')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(@UploadedFile() file: Express.Multer.File) {
    const uploadResult = await this.storageService.uploadFile(file, 'banners');
    if (!uploadResult) {
      return {
        status: false,
        message: 'Banner Upload failed',
        data: null,
      };
    }

    const image = this.configService.get('storage_link') + uploadResult.file;
    return this.bannerService.create(image);
  }

  @Get()
  async findAll(): Promise<any> {
    return await this.bannerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.bannerService.findByBannerId(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      const uploadResult = await this.storageService.uploadFile(
        file,
        'banners',
      );
      if (!uploadResult) {
        return {
          status: false,
          message: 'Banner Upload failed',
          data: null,
        };
      }

      const image = this.configService.get('storage_link') + uploadResult.file;
      return await this.bannerService.update(id, image);
    } catch (error) {
      console.error(error);
      return { status: false, message: 'Blog update failed', data: error };
    }
  }

  @Delete(':id')
  async deleteBanner(@Param('id') id: string): Promise<any> {
    return await this.bannerService.delete(id);
  }
}
