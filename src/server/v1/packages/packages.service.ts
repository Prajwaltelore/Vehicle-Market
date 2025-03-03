import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Packages, PackagesDocument } from 'src/common/schemas/packages.schema';
import { CreatePackageDto } from './dtos/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Packages.name)
    private readonly packageModel: Model<PackagesDocument>,
  ) {}

  async createPackage(createPackageDto: CreatePackageDto): Promise<any> {
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

  // async getPackages(
  //   search: string,
  //   sortBy: string,
  //   sortOrder: string,
  //   page: number = 1,
  //   limit: number = 10,
  // ) {
  //   try {
  //     const isNumeric = !isNaN(Number(search));
  //     const filter = search
  //       ? {
  //           $or: [
  //             { package_name: { $regex: search, $options: 'i' } },
  //             { features: { $regex: search, $options: 'i' } },
  //             ...(isNumeric
  //               ? [
  //                   { price: Number(search) },
  //                   { duration: Number(search) },
  //                   { offer_discount: Number(search) },
  //                   { order: Number(search) },
  //                 ]
  //               : []),
  //           ],
  //         }
  //       : {};

  //     const sort = sortBy
  //       ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  //       : { createdAt: -1 };

  //     const skip = (page - 1) * limit;

  //     const [packages, total] = await Promise.all([
  //       this.packageModel
  //         .find(filter)
  //         .sort(sort)
  //         .skip(skip)
  //         .limit(limit)
  //         .exec(),
  //       this.packageModel.countDocuments(filter).exec(),
  //     ]);

  //     if (packages) {
  //       return {
  //         status: true,
  //         message: 'Packages fetched successfully',
  //         data: {
  //           packages,
  //           total,
  //           currentPage: page,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //       };
  //     } else {
  //       return {
  //         status: false,
  //         message: 'Packages not fetched',
  //         data: null,
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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
    updatePackageDto: CreatePackageDto,
  ): Promise<Packages> {
    const updatedPackage = await this.packageModel
      .findByIdAndUpdate(id, updatePackageDto, { new: true })
      .exec();

    if (!updatedPackage) {
      throw new NotFoundException('Package not found.');
    }

    return updatedPackage;
  }

  async deletePackage(id: string): Promise<any> {
    const packageData = await this.packageModel
      .findByIdAndDelete(id, { new: true })
      .exec();

    if (!packageData) {
      throw new NotFoundException('Package not found.');
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
}
