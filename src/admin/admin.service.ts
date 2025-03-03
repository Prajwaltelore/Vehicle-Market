import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Classifieds,
  ClassifiedsDocument,
} from 'src/common/schemas/classifieds.schema';
import { AdminCreateClassifiedDto } from './dtos/createClassifiedDto';
import { Users, UsersDocument } from 'src/common/schemas/users.schema';
import { AdminUpdateUserDto } from './dtos/updateUserDto';
import {
  Categories,
  CategoriesDocument,
} from 'src/common/schemas/categories.schema';
import { Brands, BrandsDocument } from 'src/common/schemas/brands.schema';
import { AdminCreateUserDto } from './dtos/createUserDto';
import { AdminCreatePackageDto } from './dtos/createPackageDto';
import { Packages, PackagesDocument } from 'src/common/schemas/packages.schema';
import { AdminCreateBlogDto } from './dtos/createBlogDto';
import { slugify } from './utils/slugify';
import { Blogs, BlogsDocument } from 'src/common/schemas/blogs.schema';
import { AdminLoginDto } from './dtos/loginDto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from 'src/common/notifications/notifications.service';
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from 'src/common/schemas/blacklistedtoken.schema';
import { AdminCreateCategoryDto } from './dtos/createCategoryDto';
import { AdminCreateBrandDto } from './dtos/createBrandDto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Classifieds.name)
    private readonly classifiedsModel: Model<ClassifiedsDocument>,
    @InjectModel(Users.name) private readonly userModel: Model<UsersDocument>,
    @InjectModel(Categories.name)
    private readonly categoryModel: Model<CategoriesDocument>,
    @InjectModel(Brands.name)
    private readonly brandModel: Model<BrandsDocument>,
    @InjectModel(Packages.name)
    private readonly packageModel: Model<PackagesDocument>,
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    @InjectModel(BlacklistedToken.name)
    private readonly blacklistedTokenModel: Model<BlacklistedTokenDocument>,
  ) {}

  async create(
    createClassifiedDto: AdminCreateClassifiedDto,
  ): Promise<Classifieds> {
    const classified = new this.classifiedsModel(createClassifiedDto);
    return await classified.save();
  }

  async findAll(): Promise<any> {
    const result = await this.classifiedsModel
      .find()
      .populate('category', 'name -_id')
      .populate('brand', 'name -_id')
      .exec();
    console.log(result);
    if (result) {
      return {
        status: true,
        message: 'Classified details found',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Classified details not found',
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<any> {
    const result = await this.classifiedsModel.findById(id).exec();
    if (!result) {
      return {
        status: false,
        message: `Classified with ID ${id} not found`,
        data: null,
      };
    } else {
      return {
        status: true,
        message: 'Classified data found',
        data: result,
      };
    }
  }

  async update(
    id: string,
    updateClassifiedDto: AdminCreateClassifiedDto,
  ): Promise<any> {
    const result = await this.classifiedsModel
      .findByIdAndUpdate(id, updateClassifiedDto, { new: true })
      .exec();
    if (result) {
      return {
        status: true,
        message: `Classified with ID ${id} updated`,
        data: result,
      };
    } else {
      return {
        status: false,
        message: `Classified with ID ${id} not updated`,
        data: null,
      };
    }
  }

  async remove(id: string): Promise<any> {
    const result = await this.classifiedsModel.findByIdAndDelete(id).exec();
    if (result) {
      return {
        status: true,
        message: `Classified with ID ${id} deleted`,
      };
    } else {
      return {
        status: false,
        message: `Classified with ID ${id} not deleted`,
      };
    }
  }

  async updateImages(
    id: string,
    uploadResult: { etag: string; url: string; file: string },
  ): Promise<any> {
    // console.log(uploadResult)
    const imageData = {
      etag: uploadResult.etag,
      file: uploadResult.file,
      url: uploadResult.url,
    };

    return await this.classifiedsModel.findByIdAndUpdate(
      id,
      { $push: { images: imageData } }, // Add the image data to the images array
      { new: true }, // Return the updated document
    );
  }

  // remove classified images
  async deleteImageById(classifiedId: string, imageId: string): Promise<any> {
    try {
      // Find and update the document by pulling the specific image from the array
      const updatedClassified = await this.classifiedsModel.findByIdAndUpdate(
        classifiedId,
        {
          $pull: { images: { _id: imageId } },
        },
        { new: true }, // Return the updated document
      );

      if (!updatedClassified) {
        return {
          status: false,
          message: 'Classified not found',
          data: null,
        };
      }

      return {
        status: true,
        message: 'Image deleted successfully',
        data: updatedClassified,
      };
    } catch (error) {
      console.error(
        `Error deleting image with ID ${imageId} for classified ${classifiedId}:`,
        error,
      );
      return {
        status: false,
        message: 'Failed to delete image',
        error: error.message,
      };
    }
  }

  async updateUser(
    userId: string,
    updateDto: AdminUpdateUserDto,
  ): Promise<any> {
    const { email } = updateDto;

    // if (email) {
    //   const emailExists = await this.userModel.findOne({ email: email });
    //   if (emailExists) {
    //     return {
    //       status: false,
    //       message: 'Email already exists',
    //     };
    //   }
    // }

    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true },
    );
    if (result) {
      return {
        status: true,
        message: 'User updated successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'User not updated',
        data: null,
      };
    }
  }

  async updateImage(id: string, image: String): Promise<any> {
    // console.log(uploadResult)
    // const imageData = {
    //   etag: uploadResult.etag,
    //   file: uploadResult.file,
    //   url: uploadResult.url,
    // };
    // const imageName = uploadResult.file.split('/').pop();
    return await this.userModel.findByIdAndUpdate(
      id,
      { avtar: image },
      { new: true },
    );
  }

  // remove user image
  async deleteUserImageById(userId: string): Promise<any> {
    try {
      const defaultPic =
        'https://png.pngtree.com/png-vector/20190704/ourmid/pngtree-vector-user-young-boy-avatar-icon-png-image_1538408.jpg';
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { avtar: defaultPic },
        { new: true },
      );

      if (!updatedUser) {
        return {
          status: false,
          message: 'User not found',
          data: null,
        };
      }

      return {
        status: true,
        message: 'Image deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error(`Error deleting image for user ${userId}:`, error);
      return {
        status: false,
        message: 'Failed to delete image',
        error: error.message,
      };
    }
  }

  async findById(id: string) {
    const result = await this.userModel.findById(id).exec();
    if (result) {
      return {
        status: true,
        message: 'User found successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'User not found',
        data: null,
      };
    }
  }

  async getUsers(
    search: string,
    sortBy: string,
    sortOrder: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const isNumeric = !isNaN(Number(search));
      const filter = search
        ? {
            $or: [
              { firstname: { $regex: search, $options: 'i' } },
              { lastname: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              ...(isNumeric
                ? [
                    { mobile: Number(search) },
                    { country: Number(search) },
                    { state: Number(search) },
                    { city: Number(search) },
                  ]
                : []),
            ],
          }
        : {};

      const sort = sortBy
        ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
        : { createdAt: 1 };

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.userModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.userModel.countDocuments(filter).exec(),
      ]);

      if (users) {
        return {
          status: true,
          message: 'UserDetails fetched successfully',
          data: {
            users,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          },
        };
      } else {
        return {
          status: false,
          message: 'UserDetails not fetched',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async findUsers() {
    const result = await this.userModel.find();
    if (result) {
      return {
        status: true,
        message: 'Users found successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Users not found',
        data: null,
      };
    }
  }

  async deleteById(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (result) {
      return {
        status: true,
        message: 'User deleted successfully',
      };
    } else {
      return {
        status: false,
        message: 'User not deleted',
      };
    }
  }

  async createUser(createUserDto: AdminCreateUserDto): Promise<any> {
    const user = new this.userModel(createUserDto);
    const result = await user.save();
    if (result) {
      return {
        status: true,
        message: 'User created successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'User not created',
        data: null,
      };
    }
  }

  async createPackage(createPackageDto: AdminCreatePackageDto): Promise<any> {
    const { package_name } = createPackageDto;

    const existingPackage = await this.packageModel.findOne({
      package_name: package_name,
    });
    if (existingPackage) {
      return {
        status: false,
        message: 'Package with this name already exists.',
        data: null,
      };
    }

    const lastPackage = await this.packageModel
      .findOne()
      .sort({ order: -1 })
      .exec();
    const nextOrder = lastPackage ? lastPackage.order + 1 : 1;

    const newPackage = new this.packageModel({
      ...createPackageDto,
      order: nextOrder,
    });
    return newPackage.save();
  }

  async getPackages(
    search: string,
    sortBy: string,
    sortOrder: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const isNumeric = !isNaN(Number(search));
      const filter = search
        ? {
            $or: [
              { package_name: { $regex: search, $options: 'i' } },
              { features: { $regex: search, $options: 'i' } },
              ...(isNumeric
                ? [
                    { price: Number(search) },
                    { duration: Number(search) },
                    { offer_discount: Number(search) },
                    { order: Number(search) },
                  ]
                : []),
            ],
          }
        : {};

      const sort = sortBy
        ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
        : { createdAt: -1 };

      const skip = (page - 1) * limit;

      const [packages, total] = await Promise.all([
        this.packageModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.packageModel.countDocuments(filter).exec(),
      ]);

      if (packages) {
        return {
          status: true,
          message: 'Packages fetched successfully',
          data: {
            packages,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          },
        };
      } else {
        return {
          status: false,
          message: 'Packages not fetched',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllPackages(): Promise<Packages[]> {
    return this.packageModel.find().exec();
  }

  async getPackageById(id: string): Promise<any> {
    const packageData = await this.packageModel.findById(id).exec();
    if (!packageData) {
      return {
        status: false,
        message: 'Package not found.',
        data: null,
      };
    }
    return packageData;
  }

  async updatePackage(
    id: string,
    updatePackageDto: AdminCreatePackageDto,
  ): Promise<any> {
    const updatedPackage = await this.packageModel
      .findByIdAndUpdate(id, updatePackageDto, { new: true })
      .exec();

    if (!updatedPackage) {
      return {
        status: false,
        message: 'Package not found.',
      };
    }

    return updatedPackage;
  }

  async deletePackage(id: string): Promise<any> {
    const packageData = await this.packageModel
      .findByIdAndDelete(id, { new: true })
      .exec();

    if (!packageData) {
      return {
        status: false,
        message: 'Package not found.',
      };
    }

    if (packageData) {
      return {
        status: true,
        message: 'Package deleted successfully.',
      };
    } else {
      return {
        status: false,
        message: 'Package not deleted',
      };
    }
  }

  async createBlog(createBlogDto: AdminCreateBlogDto): Promise<any> {
    const { title } = createBlogDto;
    const url_slug = slugify(title);

    const createdBlog = new this.blogsModel({
      ...createBlogDto,
      url_slug: url_slug,
    });

    return createdBlog.save();
  }

  async findAllBlogs(): Promise<any> {
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

  async getBlogs(
    search: string,
    sortBy: string,
    sortOrder: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const filter = search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { shortdescription: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const sort = sortBy
        ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
        : { createdAt: 1 };

      const skip = (page - 1) * limit;

      const [blogs, total] = await Promise.all([
        this.blogsModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.blogsModel.countDocuments(filter).exec(),
      ]);

      if (blogs) {
        return {
          status: true,
          message: 'Blogs fetched successfully',
          data: {
            blogs,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          },
        };
      } else {
        return {
          status: false,
          message: 'Blogs not fetched',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateBlog(
    id: string,
    updateBlogDto: AdminCreateBlogDto,
  ): Promise<any> {
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

  async createBrand(createBrandDto: AdminCreateBrandDto): Promise<any> {
    const { name, description, category, logo } = createBrandDto;

    // Find the category ID based on the category name provided by the frontend
    const categoryDoc = await this.categoryModel.findOne({ name: category });

    if (!categoryDoc) {
      return {
        status: false,
        message: `Category "${category}" not found`,
        data: null,
      };
    }

    // Create and save the brand
    const newBrand = new this.brandModel({
      name,
      description,
      category: categoryDoc._id,
      logo,
    });

    const result = newBrand.save();
    if (result) {
      return {
        status: true,
        message: 'Brand saved successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Brand not saved',
        data: null,
      };
    }
  }

  async getBrands(
    search: string,
    sortBy: string,
    sortOrder: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const filter = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { category: { $regex: search, $options: 'i' } },
            ],
            deleted: false,
          }
        : { deleted: false };

      const sort = sortBy
        ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
        : { createdAt: -1 };

      const skip = (page - 1) * limit;

      const [brands, total] = await Promise.all([
        this.brandModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.brandModel.countDocuments(filter).exec(),
      ]);

      if (brands) {
        return {
          status: true,
          message: 'Brands fetched successfully',
          data: {
            brands,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          },
        };
      } else {
        return {
          status: false,
          message: 'Brands not fetched',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async findAllBrands() {
    const result = await this.brandModel.find().populate('category', 'name');
    if (result) {
      return {
        status: true,
        message: 'Brands fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Brands not found',
        data: null,
      };
    }
  }

  async findBrandById(id: string) {
    const result = await this.brandModel.findById(id);
    if (result) {
      return {
        status: true,
        message: 'Brand fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Brand not found',
        data: null,
      };
    }
  }

  async updateBrand(id: string, updateBrandDto: AdminCreateBrandDto) {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      return {
        status: false,
        message: 'Brand not exists',
        data: null,
      };
    }

    const result = await this.brandModel.findByIdAndUpdate(id, updateBrandDto, {
      new: true,
    });
    if (result) {
      return {
        status: true,
        message: 'Brand updated successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Brand not updated',
        data: null,
      };
    }
  }

  async removeBrand(id: string) {
    const result = await this.brandModel.findByIdAndDelete(id);
    if (result) {
      return {
        status: true,
        message: 'Brand deleted successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Brand not deleted',
        data: null,
      };
    }
  }

  async findBrandsByCategory(category: string) {
    const result = await this.brandModel.find({ category: category }).exec();
    if (result) {
      return {
        status: true,
        message: 'Brands fetched successfully',
        data: result,
      };
    } else {
      return {
        status: true,
        message: 'Brands not fetched',
        data: null,
      };
    }
  }

  async login(loginDto: AdminLoginDto): Promise<any> {
    const { mobile, password } = loginDto;
    const user = await this.userModel.findOne({ mobile: mobile });

    if (!user || !(await user.validatePassword(password))) {
      return {
        status: false,
        message: 'Invalid credentials',
        data: null,
      };
    }

    const payload = { mobile: user.mobile, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt_refresh_expiry'), // Token valid for 7 days
    });

    return {
      status: true,
      message: 'Login successful',
      data: { user, accessToken, refreshToken },
    };
  }

  async sendForgetPasswordOtp(mobile: number) {
    const userExists = await this.userModel.findOne({ mobile });

    if (!userExists) {
      return { status: false, message: 'User not found', data: null };
    }
    await this.notificationsService.sendOtp(mobile);
    return { status: true, message: 'OTP sent successfully', data: null };
  }

  async changePassword(mobile: number, password: string) {
    const userExists = await this.userModel.findOne({ mobile });

    if (!userExists) {
      return { status: false, message: 'User not found', data: null };
    }

    userExists.password = password;
    await userExists.save();

    return {
      status: true,
      message: 'Password changed successfully',
      data: userExists,
    };
  }

  async logout(token: string): Promise<{ status: boolean; message: string }> {
    const decoded = this.jwtService.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    const expiresAt = new Date(decoded.exp * 1000); // Convert expiration to Date

    await this.blacklistedTokenModel.create({ token, expiresAt });

    return { status: true, message: 'Logged out successfully' };
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        return {
          status: false,
          message: 'User not found',
          data: null,
        };
      }

      const payload = { mobile: user.mobile, sub: user._id };
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('jwt_expiry'),
      });
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt_refresh_expiry'),
      });

      return {
        status: true,
        message: 'Access token refreshed',
        data: {
          user,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'Invalid refresh token',
        data: null,
      };
    }
  }

  async createCategory(dto: AdminCreateCategoryDto): Promise<any> {
    if (dto.name) {
      const category_name = await this.categoryModel
        .findOne({ name: dto.name })
        .exec();
      if (category_name) {
        return {
          status: false,
          message: 'Category already exists',
          data: null,
        };
      }
    }

    const lastCategory = await this.categoryModel
      .findOne()
      .sort({ order: -1 })
      .exec();
    const nextOrder = lastCategory ? lastCategory.order + 1 : 1; // Increment order
    const newCategory = new this.categoryModel({ ...dto, order: nextOrder }); // Correct instantiation
    let result = await newCategory.save();

    if (result) {
      return {
        status: true,
        message: 'Category created successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Category not created',
        data: null,
      };
    }
  }

  // Method to find all categories
  async findAllCategories(): Promise<any> {
    let result = await this.categoryModel.find().exec();

    if (result) {
      return {
        status: true,
        message: 'Categories fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Categories not found',
        data: null,
      };
    }
  }

  // Method to find a category by ID
  async findByCategoryId(id: string): Promise<any> {
    let result = await this.categoryModel.findById(id).exec();

    if (result) {
      return {
        status: true,
        message: 'Category fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Category not found',
        data: null,
      };
    }
  }

  async findByName(name: string): Promise<Categories | null> {
    return this.categoryModel.findOne({ name: name }).exec();
  }

  // Method to update a category by ID
  async updateCategory(
    id: string,
    updateCategoryDto: AdminCreateCategoryDto,
  ): Promise<any> {
    let result = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (result) {
      return {
        status: true,
        message: 'Category updated successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Category not updated',
        data: null,
      };
    }
  }

  // Method to remove a category by ID
  async removeCategory(id: string): Promise<any> {
    let result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (result) {
      return {
        status: true,
        message: 'Category deleted successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Category not deleted',
        data: null,
      };
    }
  }
}
