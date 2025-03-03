import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { StorageService } from 'src/common/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@ApiTags('Blogs Controller')
@Controller('v1/blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
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
    @Body() createBlogDto: CreateBlogDto,
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
      const result = await this.blogsService.create(createBlogDto);
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

  @Get()
  async findAll(): Promise<any> {
    return await this.blogsService.findAll();
  }

  // @Get('filter')
  // @ApiQuery({
  //   name: 'search',
  //   required: false,
  //   type: String,
  //   description: 'Search term',
  // })
  // @ApiQuery({
  //   name: 'sortBy',
  //   required: false,
  //   type: String,
  //   description: 'Field to sort by',
  // })
  // @ApiQuery({
  //   name: 'sortOrder',
  //   required: false,
  //   type: String,
  //   description: 'Sort order (asc or desc)',
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   type: Number,
  //   description: 'Page number',
  //   example: 1,
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   type: Number,
  //   description: 'Results per page',
  //   example: 10,
  // })
  // async findByQuery(
  //   @Query('search') search: string,
  //   @Query('sortBy') sortBy: string,
  //   @Query('sortOrder') sortOrder: string,
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  // ) {
  //   // console.log(query);
  //   return this.blogsService.getBlogs(search, sortBy, sortOrder, page, limit);
  // }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    // if (!mongoose.Types.ObjectId.isValid(id)) { throw new BadRequestException('Invalid Blog ID format'); }
    return await this.blogsService.findByBlogId(id);
  }

  @Put(':id')
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
    @Body() updateBlogDto: UpdateBlogDto,
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
      return await this.blogsService.update(id, updateBlogDto);
    } catch (error) {
      console.error(error);
      return { status: false, message: 'Blog update failed', data: error };
    }
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string): Promise<any> {
    return await this.blogsService.delete(id);
  }

  @Post(':id/image-upload')
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
      const updatedBlog = await this.blogsService.uploadImage(id, image);

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

  // @Delete(':blogId/remove-image')
  // async deleteImage(@Param('blogId') blogId: string): Promise<any> {
  //   return await this.blogsService.deleteImageById(blogId);
  // }
}
