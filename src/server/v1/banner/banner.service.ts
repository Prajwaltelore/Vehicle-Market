import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from 'src/common/schemas/banner.schema';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {}

  async create(file: string): Promise<any> {
    const banner = new this.bannerModel({ image: file });
    const result = banner.save();
    if (result) {
      return {
        status: true,
        message: 'Banner created successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Banner not created',
        data: null,
      };
    }
  }

  async findAll(): Promise<any> {
    const result = await this.bannerModel.find().exec();
    if (result) {
      return {
        status: true,
        message: 'Banner fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Banner not fetched',
        data: null,
      };
    }
  }

  async findByBannerId(id: string): Promise<any> {
    const result = await this.bannerModel.findById(id);
    if (result) {
      return {
        status: true,
        message: 'Banner fetched By Id successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Banner not fetched By Id',
        data: null,
      };
    }
  }

  async update(id: string, file: string): Promise<any> {
    const result = await this.bannerModel.findByIdAndUpdate(
      id,
      { image: file },
      { new: true },
    );

    if (result) {
      return {
        status: true,
        message: 'Banner updated successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Banner not updated',
        data: null,
      };
    }
  }

  async delete(id: string): Promise<any> {
    const result = await this.bannerModel.findByIdAndDelete(id, { new: true });
    if (result) {
      return {
        status: true,
        message: 'Banner deleted successfully',
      };
    } else {
      return {
        status: false,
        message: 'Banner not deleted',
      };
    }
  }
}
