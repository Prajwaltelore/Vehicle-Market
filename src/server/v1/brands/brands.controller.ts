import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/common/storage/storage.service';

@ApiTags('Brands Controller')
@Controller('v1/brands')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)

export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new brand' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Yamaha' },
        description: {
          type: 'string',
          example: 'Top-quality motorbikes and scooters',
        },
        category: { type: 'string', example: '6751cb38866b94aa5fbf3192' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.storageService.uploadFile(file, 'brands');
    if (!uploadResult) {
      return {
        status: false,
        message: 'Brand Upload failed',
        data: null,
      };
    }
    createBrandDto.logo =
      this.configService.get('storage_link') + uploadResult.file;
    return await this.brandsService.create(createBrandDto);
  }

  @Get('filter')
  @ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search term',
    })
    @ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by',
    })
    @ApiQuery({
      name: 'sortOrder',
      required: false,
      type: String,
      description: 'Sort order (asc or desc)',
    })
    @ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number',
      example: 1,
    })
    @ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Results per page',
      example: 10,
    })
  async findByQuery(
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.brandsService.getBrands(search, sortBy, sortOrder, page, limit);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all brands' })
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single brand by ID' })
  async findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand by ID' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Yamaha' },
        description: {
          type: 'string',
          example: 'Top-quality motorbikes and scooters',
        },
        category: { type: 'string', example: '6751cb38866b94aa5fbf3192' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const uploadResult = await this.storageService.uploadFile(file, 'brands');
    if (!uploadResult) {
      return {
        status: false,
        message: 'Brand Upload failed',
        data: null,
      };
    }
    updateBrandDto.logo =
      this.configService.get('storage_link') + uploadResult.file;
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brand by ID' })
  async remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
