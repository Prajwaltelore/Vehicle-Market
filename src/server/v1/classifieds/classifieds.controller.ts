import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClassifiedsService } from './classifieds.service';
import { StorageService } from '../../../common/storage/storage.service';
import { CreateClassifiedDto } from './dtos/create-classified.dto';
import { Classifieds } from '../../../common/schemas/classifieds.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';
import mongoose from 'mongoose';
import { FilterClassifiedDto } from './dtos/filter-classified.dto';

@ApiTags('Classifieds Controller')
@Controller('v1/classifieds')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
export class ClassifiedsController {
  constructor(
    private readonly classifiedsService: ClassifiedsService,
    private readonly storageService: StorageService,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new classified' })
  async create(
    @Req() req: any,
    @Body() createClassifiedDto: CreateClassifiedDto,
  ): Promise<any> {
    try {

      createClassifiedDto.user = req.user.sub;

      let categoryResult = null;

      const isCategoryId = mongoose.Types.ObjectId.isValid(
        createClassifiedDto.category,
      );

      if (isCategoryId) {
        const category = await this.categoriesService.findOne(
          createClassifiedDto.category,
        );
        if (!category) {
          return {
            status: false,
            message: `Category with ID ${createClassifiedDto.category} not found`,
            data: null,
          };
        }
        categoryResult = category.data;
        console.log(categoryResult);
      } else {
        let category = await this.categoriesService.findByName(
          createClassifiedDto.category,
        );
        if (!category) {

          const categoryData = {
            name: createClassifiedDto.category,
            description: `Auto-generated description for ${createClassifiedDto.category}`,
            image: 'default-image-url',
          };

          const categoryResponse =
            await this.categoriesService.create(categoryData);

          if (
            !categoryResponse ||
            !categoryResponse.data ||
            !categoryResponse.data._id
          ) {
            return {
              status: false,
              message: `Category creation failed: No ID returned`,
              data: null,
            };
          }

          categoryResult = categoryResponse.data;
          console.log(categoryResult);
        } else {
          categoryResult = category;
          console.log(categoryResult);
        }
      }


      const categoryId = categoryResult._id.toString();
      console.log(`Category ID: ${categoryId}`);


      let brand = await this.brandsService.findByName(
        createClassifiedDto.brand,
      );
      let brandResult = brand;

      if (!brand) {
        const brandData = {
          name: createClassifiedDto.brand,
          description: `Auto-generated description for ${createClassifiedDto.brand}`,
          category: categoryId,
          logo: 'default-logo-url',
        };

        const brandResponse = await this.brandsService.create(brandData);
        console.log(brandResponse);

        if (!brandResponse || !brandResponse.data || !brandResponse.data._id) {
          console.error('Brand creation failed response:', brandResponse);
          return {
            status: false,
            message: `Brand creation failed: No ID returned`,
            data: null,
          };
        }
        brandResult = brandResponse.data;
      }

      const brandId = brandResult._id.toString();
      console.log(brandId);

      // Set the category and brand IDs in the DTO
      createClassifiedDto.category = categoryId;
      createClassifiedDto.brand = brandId;

      const classified =
        await this.classifiedsService.create(createClassifiedDto);
      return {
        status: true,
        message: 'Classified created successfully',
        data: classified,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'Failed to create classified',
        data: error,
      };
    }
  }

  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Search by Vehicle Name',
    example: 'cars24',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Search by location',
    example: 'Afghanistan',
  })

  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Search by Category Name',
    example: 'Car',
  })
  @ApiQuery({
    name: 'price',
    required: false,
    type: String,
    description: 'Search by price',
    example: '0-1000000',
  })
  @Get('filter')
  @ApiOperation({ summary: 'Filter classifieds' })
  async filter(
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('category') category?: string,
    @Query('price') price?: string,
  ): Promise<any> {
    const filters = { title, location, category, price };
    return this.classifiedsService.filter(filters);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classifieds' })
  async findAll(): Promise<Classifieds[]> {
    return await this.classifiedsService.findAll();
  }



  @Patch(':id')
  @ApiOperation({ summary: 'Update a classified by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateClassifiedDto: CreateClassifiedDto,
  ): Promise<Classifieds> {
    return this.classifiedsService.update(id, updateClassifiedDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a classified by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.classifiedsService.remove(id);
  }

  @Post(':id/upload-media')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
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
  @ApiOperation({ summary: 'Upload media to a classified' })
  async uploadSingleFile(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<any> {
    try {
      const uploadResult = await this.storageService.uploadFile(
        file,
        'classifieds',
      );
      console.log(file);
      if (!uploadResult) {
        return {
          status: false,
          message: 'Classified Upload failed',
          data: null,
        };
      }

      const updateResult = await this.classifiedsService.updateImages(
        id,
        uploadResult,
      );

      if (!updateResult) {
        return {
          status: false,
          message: 'Failed to update classifieds',
          data: null,
        };
      }

      return {
        status: true,
        message: 'File uploaded and classified updated successfully',
        data: updateResult,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'File upload failed',
        data: error,
      };
    }
  }

  @Delete(':classifiedId/remove-media/:imageId')
  @ApiOperation({ summary: 'Delete media from a classified' })
  async deleteImage(
    @Param('classifiedId') classifiedId: string,
    @Param('imageId') imageId: string,
  ): Promise<any> {
    return this.classifiedsService.deleteImageById(classifiedId, imageId);
  }

  @Get('drafted')
  async getDraftedAds() {
    return await this.classifiedsService.getAdsByStatus('draft');
  }

  @Get('active')
  async getActiveAds() {
    return await this.classifiedsService.getAdsByStatus('active');
  }

  @Get('rejected')
  async getRejectedAds() {
    return await this.classifiedsService.getAdsByStatus('rejected');
  }

  @Get('pending')
  async getPendingAds() {
    return await this.classifiedsService.getAdsByStatus('inprocess');
  }

  @Get('userId')
  async getAdsByUserId(@Req() req: any) {
    const userId = req.user?.sub;
    // console.log(req.user);
    // console.log(userId);
    return await this.classifiedsService.getAdsByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a classified by ID' })
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.classifiedsService.getById(id);
  }

  @Put(':id/views')
  async updateViews(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    // console.log(userId);
    const updatedClassified = await this.classifiedsService.updatetViews(
      id,
      userId,
    );
    if (updatedClassified) {
      return {
        status: true,
        message: 'Views updated successfully',
        data: updatedClassified,
      };
    } else {
      return {
        status: true,
        message: 'Views not updated',
        data: null,
      };
    }
  }

  @Put(':id/likes')
  async toggleLikes(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    const updatedClassified = await this.classifiedsService.toggleLikes(
      id,
      userId,
    );
    if (updatedClassified) {
      return {
        status: true,
        message: 'Likes updated successfully',
        data: updatedClassified,
      };
    } else {
      return {
        status: true,
        message: 'Likes not updated',
        data: null,
      };
    }
  }

  @Post('data-filter')
  @ApiOperation({ summary: 'Data filter using query parameters' })
  async searchClassifieds(@Body() body: FilterClassifiedDto) {
    return this.classifiedsService.searchClassifieds(body);
  }

}
