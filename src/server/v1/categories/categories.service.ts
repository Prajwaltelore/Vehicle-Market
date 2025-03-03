import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  Categories,
  CategoriesDocument,
} from 'src/common/schemas/categories.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name)
    private readonly categoryModel: Model<CategoriesDocument>,
  ) {}

  // Method to create a new category
  async create(dto: CreateCategoryDto): Promise<any> {
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
  async findAll(): Promise<any> {
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
  async findOne(id: string): Promise<any> {
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
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
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
  async remove(id: string): Promise<any> {
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
