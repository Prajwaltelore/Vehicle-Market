import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, RootFilterQuery } from 'mongoose';
import {
  Classifieds,
  ClassifiedsDocument,
} from '../../../common/schemas/classifieds.schema';
import { CreateClassifiedDto } from './dtos/create-classified.dto';
import { Brands, BrandsDocument } from '../../../common/schemas/brands.schema';
import {
  Countries,
  CountriesDocument,
} from '../../../common/schemas/countries.schema';
import { States, StatesDocument } from '../../../common/schemas/states.schema';
import { Cities, CitiesDocument } from '../../../common/schemas/cities.schema';
import {
  Categories,
  CategoriesDocument,
} from '../../../common/schemas/categories.schema';
import { FilterClassifiedDto } from './dtos/filter-classified.dto';

@Injectable()
export class ClassifiedsService {
  constructor(
    @InjectModel(Classifieds.name)
    private readonly classifiedsModel: Model<ClassifiedsDocument>,
    @InjectModel(Brands.name)
    private readonly brandsModel: Model<BrandsDocument>,
    @InjectModel(Countries.name)
    private readonly countriesModel: Model<CountriesDocument>,
    @InjectModel(States.name)
    private readonly statesModel: Model<StatesDocument>,
    @InjectModel(Cities.name)
    private readonly citiesModel: Model<CitiesDocument>,
    @InjectModel(Categories.name)
    private readonly categoryModel: Model<CategoriesDocument>,
  ) {}

  async create(createClassifiedDto: CreateClassifiedDto): Promise<Classifieds> {
    const classified = new this.classifiedsModel(createClassifiedDto);
    return await classified.save();
  }

  async findAll(): Promise<any> {
    const result = await this.classifiedsModel.find().exec();
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

  async getById(id: string): Promise<any> {
    const result = await this.classifiedsModel.findById(new mongoose.Types.ObjectId(id)).exec();
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
    updateClassifiedDto: CreateClassifiedDto,
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

  async filter(filters: {
    title?: string;
    location?: string;
    category?: string;
    price?: string;
  }): Promise<any> {
    const { title, location, category, price } = filters;
    const isNumeric = !isNaN(Number(price));
    const matchConditions: any = {};

    if (title) {
      matchConditions.title = { $regex: title, $options: 'i' };
      if (!matchConditions) {
        return {
          status: false,
          message: 'Vehicle not found',
          data: null,
        };
      }
    }

    if (price) {
      const [minPrice, maxPrice] = price.split('-').map(Number);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        matchConditions.price = { $gte: minPrice, $lte: maxPrice };
      } else {
        return {
          status: false,
          message: 'Invalid price range',
          data: null,
        };
      }
    }

    if (location) {
      const country = await this.countriesModel
        .findOne({ name: location })
        .exec();
      // console.log(country);
      const state = await this.statesModel.findOne({ name: location }).exec();
      // console.log(state);
      const city = await this.citiesModel.findOne({ name: location }).exec();
      // console.log(city);

      if (!country && !state && !city) {
        return {
          status: false,
          message: `Location '${location}' not found`,
          data: null,
        };
      }

      const locationId: any = {};
      if (country) locationId.country = country.id;
      if (state) locationId.state = state.id;
      if (city) locationId.city = city.id;
      // console.log(locationId);

      if (locationId.country) matchConditions.country = locationId.country;
      if (locationId.state) matchConditions.state = locationId.state;
      if (locationId.city) matchConditions.city = locationId.city;
    }
    // console.log(matchConditions);

    let categoryId = null;
    if (category) {
      const categoryRecord = await this.categoryModel
        .findOne({ name: category })
        .exec();
      if (categoryRecord) {
        categoryId = categoryRecord.id;
        matchConditions.category = categoryId;
      } else {
        return {
          status: false,
          message: `Category '${category}' not found`,
          data: null,
        };
      }
    }


    let classifieds = [];
    let brands = [];

    classifieds = await this.classifiedsModel
      .find(matchConditions)
      .sort({ createdAt: -1 })
      .exec();
    const classified = classifieds.map((cat_id) => cat_id.category);
    brands = await this.brandsModel
      .find({ category: classified })
      .sort({ createdAt: -1 })
      .exec();

    if (categoryId) {
      brands = await this.brandsModel
        .find({ category: categoryId })
        .sort({ createdAt: -1 })
        .exec();
      classifieds = await this.classifiedsModel
        .find({ category: categoryId })
        .sort({ createdAt: -1 })
        .exec();
    }

    if (classifieds.length || brands.length) {
      return {
        status: true,
        message: 'Brands & Classifieds fetched successfully',
        data: { brands, classifieds },
      };
    } else {
      return {
        status: false,
        message: 'No Brands or Classifieds found',
        data: null,
      };
    }
  }

  async getAdsByStatus(status: string) {
    // const filter = { status };
    const result = await this.classifiedsModel.find({status: status}).exec();

    if (result) {
      return {
        status: true,
        message: 'Ads fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Ads not fetched',
        data: null,
      };
    }
  }

  async getAdsByUserId(userId: string) {
    // const filter = { user: new mongoose.Types.ObjectId(userId) };
    const result = await this.classifiedsModel.find({user: userId}).exec();
    console.log(result);
    if (result) {
      return {
        status: true,
        message: 'Ads fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Ads not fetched',
        data: null,
      };
    }
  }

  async updatetViews(id: string, userId: string): Promise<any> {
    const classified = await this.classifiedsModel.findById(id);
    if (!classified) {
      return {
        status: false,
        message: 'Classified not found',
        data: null,
      };
    }

    const hasViewed = classified.viewedBy.includes(userId);
    console.log(hasViewed);
    if (hasViewed === false) {
      classified.views += 1;
      classified.viewedBy.push(userId);
      return classified.save();
    } else {
      return classified.save();
    }
  }

  async toggleLikes(id: string, userId: string): Promise<any> {
    const classified = await this.classifiedsModel.findById(id);
    if (!classified) {
      return {
        status: false,
        message: 'Classified not found',
        data: null,
      };
    }

    const userIndex = classified.likedBy.indexOf(userId);
    if (userIndex === -1) {
      classified.likes += 1;
      classified.likedBy.push(userId);
      return classified.save();
    } else {
      classified.likes -= 1;
      classified.likedBy.splice(userIndex, 1);

      return classified.save();
    }
  }

  async searchClassifieds(query: FilterClassifiedDto) {
    const {
      title,
      category,
      brand,
      minPrice,
      maxPrice,
      location,
      radius,
      minDistanceKm,
      maxDistanceKm,
      page = 1,
      limit = 10,
      sort = 'nearest',
    } = query;
    const filters: any = {};

    if (title) filters.title = title;
    if (category) filters.category = new mongoose.Types.ObjectId(category);
    if (brand) filters.brand = new mongoose.Types.ObjectId(brand);
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = minPrice;
      if (maxPrice !== undefined) filters.price.$lte = maxPrice;
    }
    if (minDistanceKm !== undefined || maxDistanceKm !== undefined) {
      filters.kms_driven = {};
      if (minDistanceKm !== undefined) filters.kms_driven.$gte = minDistanceKm;
      if (maxDistanceKm !== undefined) filters.kms_driven.$lte = maxDistanceKm;
    }
    
    // Geolocation filter
    const geoFilter = location
      ? {
          $geoNear: {
            near: { type: 'Point', coordinates: location.coordinates },
            distanceField: 'distance',
            maxDistance: radius,
            spherical: true,
          },
        }
      : null;
    console.log(geoFilter);
    // Sorting
    const sortOrder: any = {};
    if (sort === 'nearest' && location) {
      sortOrder.distance = 1; // Nearest first
    } else if (sort === 'badge') {
      sortOrder.classified_badge = 1; // Premium -> Regular
    } else {
      sortOrder.createdAt = -1; // Last created first
    }
    console.log(sortOrder);
    console.log(filters);
    // Aggregation Pipeline
    const pipeline: any[] = [];
    if (geoFilter) pipeline.push(geoFilter);

    pipeline.push({ $match: filters });
    pipeline.push({ $sort: sortOrder });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Execute Query
    const results = await this.classifiedsModel.aggregate(pipeline);
    const total = await this.classifiedsModel.countDocuments(filters);

    return {
      total,
      page,
      limit,
      results,
    };
  }
}
