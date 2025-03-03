// src/blogs/blogs.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { slugify } from './utils/slugify';
import { Blogs, BlogsDocument } from 'src/common/schemas/blogs.schema';

import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<any> {
    const { title } = createBlogDto;
    const url_slug = slugify(title);

    const createdBlog = new this.blogsModel({
      ...createBlogDto,
      url_slug: url_slug,
    });

    return createdBlog.save();
  }

  async findAll(): Promise<any> {
    const result = await this.blogsModel.find().exec();
    if (result) {
      return {
        status: true,
        message: 'Blogs retrieved successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Blogs not retrieved',
        data: null,
      };
    }
  }

  async findByBlogId(id: string): Promise<any> {
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   throw new BadRequestException('Invalid Blog ID format');
    // }
    // if (!mongoose.isValidObjectId(id)) {
    //   return {
    //     status: false,
    //     message: 'Invalid ID format',
    //     data: null,
    //   };
    // }
    const result = await this.blogsModel.findById(id);
    if (result) {
      return {
        status: true,
        message: 'Blog retrieved By Id successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Blog not retrieved By Id',
        data: null,
      };
    }
  }

  // async getBlogs(
  //   search: string,
  //   sortBy: string,
  //   sortOrder: string,
  //   page: number = 1,
  //   limit: number = 10,
  // ) {
  //   try {
  //     const filter = search
  //       ? {
  //           $or: [
  //             { title: { $regex: search, $options: 'i' } },
  //             { shortdescription: { $regex: search, $options: 'i' } },
  //             { description: { $regex: search, $options: 'i' } },
  //           ],
  //         }
  //       : {};

  //     const sort = sortBy
  //       ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  //       : { createdAt: 1 };

  //     const skip = (page - 1) * limit;

  //     const [blogs, total] = await Promise.all([
  //       this.blogsModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
  //       this.blogsModel.countDocuments(filter).exec(),
  //     ]);

  //     if (blogs) {
  //       return {
  //         status: true,
  //         message: 'Blogs fetched successfully',
  //         data: {
  //           blogs,
  //           total,
  //           currentPage: page,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //       };
  //     } else {
  //       return {
  //         status: false,
  //         message: 'Blogs not fetched',
  //         data: null,
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<any> {
    const { title } = updateBlogDto;
    const url_slug = slugify(title);

    const result = await this.blogsModel.findByIdAndUpdate(
      id,
      { ...updateBlogDto, url_slug },
      { new: true },
    );

    if (result) {
      return {
        status: true,
        message: 'Blog updated successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Blog not updated',
        data: null,
      };
    }
  }

  async delete(id: string): Promise<any> {
    const result = await this.blogsModel.findByIdAndDelete(id, { new: true });
    if (result) {
      return {
        status: true,
        message: 'Blog deleted successfully',
      };
    } else {
      return {
        status: false,
        message: 'Blog not deleted',
      };
    }
  }

  async uploadImage(id: string, url: string): Promise<any> {
    // const imageData = {
    //   etag: uploadResult.etag,
    //   file: uploadResult.file,
    //   url: uploadResult.url,
    // };

    const result = await this.blogsModel.findByIdAndUpdate(
      id,
      { image: url },
      { new: true },
    );

    if (!result) {
      return {
        status: false,
        message: 'Blog not found',
        data: null,
      };
    }

    return result;
  }

  // async deleteImageById(blogId: string): Promise<any> {
  //   try {

  //     const updatedBlog = await this.blogsModel.findByIdAndUpdate(
  //       blogId,
  //       { image: null },
  //       { new: true },
  //     );

  //     if (!updatedBlog) {
  //       return {
  //         status: false,
  //         message: 'Blog not found',
  //         data: null,
  //       };
  //     }

  //     return {
  //       status: true,
  //       message: 'Image deleted successfully',
  //       data: null,
  //     };
  //   } catch (error) {
  //     return {
  //       status: false,
  //       message: 'Failed to delete image',
  //       error: error.message,
  //     };
  //   }
  // }
}
