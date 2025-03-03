import {
  Body,
  Controller,
  Delete,
  Get,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Classifieds } from 'src/common/schemas/classifieds.schema';
import { StorageService } from 'src/common/storage/storage.service';
import { ClassifiedsService } from 'src/server/v1/classifieds/classifieds.service';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminCreateClassifiedDto } from './dtos/createClassifiedDto';
import { AdminUpdateUserDto } from './dtos/updateUserDto';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { CategoriesService } from 'src/server/v1/categories/categories.service';
import { BrandsService } from 'src/server/v1/brands/brands.service';
import { AdminCreateUserDto } from './dtos/createUserDto';
import { AdminCreatePackageDto } from './dtos/createPackageDto';
import { AdminCreateBlogDto } from './dtos/createBlogDto';
import { AdminLoginDto } from './dtos/loginDto';
import { AdminForgetPasswordOtpDto } from './dtos/ForgotPasswordDto';
import { AdminVerifyForgetPasswordOtpDto } from './dtos/VerifyPasswordDto';
import { NotificationsService } from 'src/common/notifications/notifications.service';
import { AdminCreateCategoryDto } from './dtos/createCategoryDto';
import { AdminCreateBrandDto } from './dtos/createBrandDto';

@ApiTags('Admin Controller')
@Controller('api/admin')

export class AdminController {
  constructor(
    private readonly storageService: StorageService,
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('classifieds')
  @ApiOperation({ summary: 'Create a new classified' })
  async create(
    @Req() req: any,
    @Body() createClassifiedDto: AdminCreateClassifiedDto,
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

      const classified = await this.adminService.create(createClassifiedDto);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('classifieds')
  @ApiOperation({ summary: 'Get all classifieds' })
  async findAll(): Promise<Classifieds[]> {
    return await this.adminService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('classifieds/:id')
  @ApiOperation({ summary: 'Get a classified by ID' })
  async findOne(@Param('id') id: string): Promise<Classifieds> {
    return await this.adminService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('classifieds/:id')
  @ApiOperation({ summary: 'Update a classified by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateClassifiedDto: AdminCreateClassifiedDto,
  ): Promise<Classifieds> {
    return this.adminService.update(id, updateClassifiedDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Delete('classifieds/:id')
  @ApiOperation({ summary: 'Delete a classified by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.adminService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('classifieds/:id/upload-media')
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

      const updateResult = await this.adminService.updateImages(
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Delete('classifieds/:classifiedId/remove-media/:imageId')
  @ApiOperation({ summary: 'Delete media from a classified' })
  async deleteImage(
    @Param('classifiedId') classifiedId: string,
    @Param('imageId') imageId: string,
  ): Promise<any> {
    return this.adminService.deleteImageById(classifiedId, imageId);
  }

  @Put('users/update-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  async updateUser(@Req() req: any, @Body() updateUserDto: AdminUpdateUserDto) {
    const userId = req.user.sub;
    return await this.adminService.updateUser(userId, updateUserDto);
  }

  @Post('users/upload-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
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
  async uploadImage(@Req() req: any, @UploadedFile() file: any): Promise<any> {
    try {
      const userId = req.user.sub;

      // Upload the file to Contabo
      const uploadResult = await this.storageService.uploadFile(
        file,
        'profiles',
      );

      if (!uploadResult) {
        return {
          status: false,
          message: 'Profile Upload failed',
          data: null,
        };
      }
      // console.log(req.user);
      // console.log(userId);
      const image = this.configService.get('storage_link') + uploadResult.file;
      const updateResult = await this.adminService.updateImage(userId, image);

      if (!updateResult) {
        return {
          status: false,
          message: 'Failed to update user profile',
          data: null,
        };
      }

      return {
        status: true,
        message: 'File uploaded and user profile updated successfully',
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

  @Delete('users/remove-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  async deleteProfileImage(@Req() req: any): Promise<any> {
    const userId = req.user.sub;

    // console.log(req.user)
    return this.adminService.deleteUserImageById(userId);
  }

  @Get('users/filter')
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
    // console.log(query);
    return this.adminService.getUsers(search, sortBy, sortOrder, page, limit);
  }

  @Get('users')
  async getUsers() {
    return await this.adminService.findUsers();
  }

  @Get('users/:id')
  async getById(@Param('id') id: string) {
    return await this.adminService.findById(id);
  }

  @Delete('users/:id')
  async deleteById(@Param('id') id: string) {
    return await this.adminService.deleteById(id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(@Body() createUserDto: AdminCreateUserDto) {
    try {
      return await this.adminService.createUser(createUserDto);
    } catch (error) {
      console.log(error);
      return `An error occurred while creating the user. Please try again later.`;
    }
  }

  @Post('packages')
  async createPackage(@Body() createPackageDto: AdminCreatePackageDto) {
    try {
      console.log(createPackageDto);
      const packageData =
        await this.adminService.createPackage(createPackageDto);
      if (packageData) {
        return {
          status: true,
          message: 'Package created successfully',
          data: packageData,
        };
      } else {
        return {
          status: false,
          message: 'Package not created',
          data: null,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @Get('packages/filter')
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
  async findByPackageQuery(
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    // console.log(query);
    return this.adminService.getPackages(
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    );
  }

  @Get('packages')
  async getAllPackages() {
    try {
      const packages = await this.adminService.getAllPackages();
      if (packages) {
        return {
          status: true,
          message: 'Packages retrieved successfully',
          data: packages,
        };
      } else {
        return {
          status: false,
          message: 'Packages not retrieved',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @Get('packages/:id')
  async getPackageById(@Param('id') id: string) {
    try {
      const packageData = await this.adminService.getPackageById(id);
      if (packageData) {
        return {
          status: true,
          message: 'Package retrieved successfully',
          data: packageData,
        };
      } else {
        return {
          status: false,
          message: 'Package not retrieved',
          data: null,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Package not found',
      };
    }
  }

  @Put('packages/:id')
  async updatePackage(
    @Param('id') id: string,
    @Body() updatePackageDto: AdminCreatePackageDto,
  ) {
    try {
      const updatedPackage = await this.adminService.updatePackage(
        id,
        updatePackageDto,
      );
      if (updatedPackage) {
        return {
          status: true,
          message: 'Package updated successfully',
          data: updatedPackage,
        };
      } else {
        return {
          status: false,
          message: 'Package not updated',
          data: null,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to update package',
      };
    }
  }

  @Delete('packages/:id')
  async deletePackage(@Param('id') id: string) {
    try {
      return await this.adminService.deletePackage(id);
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to delete package',
      };
    }
  }

  @Post('blogs')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Sample Blog Title' },
        shortDescription: {
          type: 'string',
          example: 'This is a short description of the blog.',
        },
        description: {
          type: 'string',
          example: 'This is the full description of the blog.',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async createBlog(
    @Body() createBlogDto: AdminCreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      const uploadResult = await this.storageService.uploadFile(file, 'blogs');
      if (!uploadResult) {
        return {
          status: false,
          message: 'Blog Upload failed',
          data: null,
        };
      }
      createBlogDto.image =
        this.configService.get('storage_link') + uploadResult.file;
      const result = await this.adminService.createBlog(createBlogDto);
      if (result) {
        return {
          status: true,
          message: 'Blogs created successfully',
          data: result,
        };
      } else {
        return {
          status: false,
          message: 'Blogs not created',
          data: null,
        };
      }
    } catch (error) {
      console.error(error);
      return { status: false, message: 'Blog creation failed', data: error };
    }
  }

  @Get('blogs')
  async findAllBlogs(): Promise<any> {
    return await this.adminService.findAllBlogs();
  }

  @Get('blogs/filter')
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
  async findByBlogQuery(
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    // console.log(query);
    return this.adminService.getBlogs(search, sortBy, sortOrder, page, limit);
  }

  @Get('blogs/:id')
  async findByBlogId(@Param('id') id: string): Promise<any> {
    // if (!mongoose.Types.ObjectId.isValid(id)) { throw new BadRequestException('Invalid Blog ID format'); }
    return await this.adminService.findByBlogId(id);
  }

  @Put('blogs/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Sample Blog Title' },
        shortDescription: {
          type: 'string',
          example: 'This is a short description of the blog.',
        },
        description: {
          type: 'string',
          example: 'This is the full description of the blog.',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: AdminCreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      const uploadResult = await this.storageService.uploadFile(file, 'blogs');
      if (!uploadResult) {
        return {
          status: false,
          message: 'Blog Upload failed',
          data: null,
        };
      }
      updateBlogDto.image =
        this.configService.get('storage_link') + uploadResult.file;
      return await this.adminService.updateBlog(id, updateBlogDto);
    } catch (error) {
      console.error(error);
      return { status: false, message: 'Blog update failed', data: error };
    }
  }

  @Delete('blogs/:id')
  async deleteBlog(@Param('id') id: string): Promise<any> {
    return await this.adminService.delete(id);
  }

  @Post('blogs/:id/image-upload')
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
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      const uploadResult = await this.storageService.uploadFile(file, 'blogs');
      if (!uploadResult) {
        return {
          status: false,
          message: 'Blog Upload failed',
          data: null,
        };
      }

      const image = this.configService.get('storage_link') + uploadResult.file;
      const updatedBlog = await this.adminService.uploadImage(id, image);

      if (!updatedBlog) {
        return {
          status: false,
          message: 'Failed to update blog',
          data: null,
        };
      }

      return {
        status: true,
        message: 'File uploaded and blog updated successfully',
        data: updatedBlog,
      };
    } catch (error) {
      console.error(error);
      return { status: false, message: 'File upload failed', data: error };
    }
  }

  @Post('brands')
  @ApiOperation({ summary: 'Add a new brand' })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
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
  async createBrand(
    @Body() createBrandDto: AdminCreateBrandDto,
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
    return await this.adminService.createBrand(createBrandDto);
  }

  @Get('brands/filter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
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
  async findByBrandQuery(
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.adminService.getBrands(
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    );
  }

  @Get('brands')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Retrieve all brands' })
  async findAllBrands() {
    return this.adminService.findAllBrands();
  }

  @Get('brands/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Retrieve a single brand by ID' })
  async findBrandById(@Param('id') id: string) {
    return this.adminService.findBrandById(id);
  }

  @Patch('brands/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
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
  async updateBrand(
    @Param('id') id: string,
    @Body() updateBrandDto: AdminCreateBrandDto,
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
    return this.adminService.updateBrand(id, updateBrandDto);
  }

  @Delete('brands/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a brand by ID' })
  async removeBrand(@Param('id') id: string) {
    return this.adminService.removeBrand(id);
  }

  @Post('auth/login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto);
  }

  @Post('auth/otp/forget-password')
  async forgetPassword(
    @Body() forgetPasswordOtpDto: AdminForgetPasswordOtpDto,
  ) {
    return this.adminService.sendForgetPasswordOtp(forgetPasswordOtpDto.mobile);
  }

  @Post('auth/otp/forget-password/verify')
  async forgetPasswordVerification(
    @Body() requestData: AdminVerifyForgetPasswordOtpDto,
  ) {
    let result = await this.notificationsService.validateOtp(
      requestData.mobile,
      requestData.otp,
    );
    if (result) {
      return this.adminService.changePassword(
        requestData.mobile,
        requestData.password,
      );
    } else {
      return { status: false, message: 'Invalid OTP/Mobile', data: null };
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('auth/logout')
  async logout(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.adminService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('auth/refresh-token')
  async refreshAccessToken(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.adminService.refreshAccessToken(token);
  }

  @Post('categories')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new category' })
  // @ApiResponse({ status: 201, description: 'Category created successfully', type: Categories })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Vans' },
        description: {
          type: 'string',
          example: 'The description of the category',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async createCategory(
    @Body() createCategoryDto: AdminCreateCategoryDto,
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
    createCategoryDto.image =
      this.configService.get('storage_link') + uploadResult.file;
    return await this.adminService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  // @ApiResponse({ status: 200, description: 'List of categories', type: [Categories] })
  async findAllCategories() {
    return await this.adminService.findAllCategories();
  }

  @Get('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get a category by ID' })
  // @ApiResponse({ status: 200, description: 'Category found', type: Categories })
  // @ApiResponse({ status: 404, description: 'Category not found' })
  async findByCategoryId(@Param('id') id: string) {
    return await this.adminService.findByCategoryId(id);
  }

  @Patch('categories/:id')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
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
        description: {
          type: 'string',
          example: 'The description of the category',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: AdminCreateCategoryDto,
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
    updateCategoryDto.image =
      this.configService.get('storage_link') + uploadResult.file;
    return await this.adminService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a category by ID' })
  // @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  // @ApiResponse({ status: 404, description: 'Category not found' })
  async removeCategory(@Param('id') id: string) {
    return await this.adminService.removeCategory(id);
  }

  @Get('categories/:id/brands')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get brands by category ID' })
  async findBrandsByCategory(@Param('id') id: string) {
    return await this.adminService.findBrandsByCategory(id);
  }
}
