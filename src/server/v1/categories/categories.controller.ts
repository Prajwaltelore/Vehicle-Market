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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Categories } from 'src/common/schemas/categories.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/common/storage/storage.service';
import { BrandsService } from '../brands/brands.service';

@ApiTags('Categories Controller')
@Controller('v1/categories')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)

export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly brandsService: BrandsService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new category' })
  // @ApiResponse({ status: 201, description: 'Category created successfully', type: Categories })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Vans' },
        description: { type: 'string', example: 'The description of the category' },
        file: {
          type: 'string',  
          format: 'binary',
        }
      },                             
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.storageService.uploadFile(
      file,
      'categories',
    );
    console.log(uploadResult);
    if (!uploadResult) {
      return {
        status: false,
        message: 'Category Upload failed',
        data: null,
      };
    }
    createCategoryDto.image = this.configService.get("storage_link") + uploadResult.file;;
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  // @ApiResponse({ status: 200, description: 'List of categories', type: [Categories] })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  // @ApiResponse({ status: 200, description: 'Category found', type: Categories })
  // @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update a category by ID' })
  // @ApiResponse({ status: 200, description: 'Category updated successfully', type: Categories })
  // @ApiResponse({ status: 400, description: 'Invalid data provided' })
  // @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Vans' },
        description: { type: 'string', example: 'The description of the category' },
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);
    const uploadResult = await this.storageService.uploadFile(
      file,
      'categories',
    );
    if (!uploadResult) {
      return {
        status: false,
        message: 'Category Upload failed',
        data: null,
      };
    }
    updateCategoryDto.image = this.configService.get("storage_link") + uploadResult.file;
    return await this.categoriesService.update(id, updateCategoryDto);
    
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  // @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  // @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    return await this.categoriesService.remove(id);
  }

  @Get(':id/brands')
  @ApiOperation({ summary: 'Get brands by category ID' })
  async findBrandsByCategory(@Param('id') id: string) {
    return await this.brandsService.findBrandsByCategory(id);
  }

}
