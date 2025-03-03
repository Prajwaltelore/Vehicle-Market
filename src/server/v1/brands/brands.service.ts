import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { StorageService } from '../../../common/storage/storage.service';
import { Brands, BrandsDocument } from '../../../common/schemas/brands.schema';
import {
  Categories,
  CategoriesDocument,
} from '../../../common/schemas/categories.schema';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brands.name)
    private readonly brandModel: Model<BrandsDocument>,
    @InjectModel(Categories.name)
    private readonly categoryModel: Model<CategoriesDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<any> {
    // Validate category existence
    const category = await this.categoryModel.findById(createBrandDto.category);
    if (!category) {
      return {
        status: false,
        message: 'Category do not exists',
        data: null,
      };
    }

    const newBrand = new this.brandModel(createBrandDto);
    const result = await newBrand.save();
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

  async findAll() {
    const result = await this.brandModel.find();
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

  async findOne(id: string) {
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

  async update(id: string, updateBrandDto: UpdateBrandDto) {
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

  async remove(id: string) {
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

  async findByName(name: string): Promise<Brands | null> {
    return this.brandModel.findOne({ name: name }).exec();
  }
}
