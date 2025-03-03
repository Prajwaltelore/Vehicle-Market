import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePackageDto } from './dtos/create-package.dto';

@ApiTags('Packages Controller')
@Controller('v1/packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  async createPackage(@Body() createPackageDto: CreatePackageDto) {
    try {
      console.log(createPackageDto);
      const packageData =
        await this.packagesService.createPackage(createPackageDto);
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
  //   return this.packagesService.getPackages(
  //     search,
  //     sortBy,
  //     sortOrder,
  //     page,
  //     limit,
  //   );
  // }

  @Get()
  async getAllPackages() {
    try {
      const packages = await this.packagesService.getAllPackages();
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

  @Get(':id')
  async getPackageById(@Param('id') id: string) {
    try {
      const packageData = await this.packagesService.getPackageById(id);
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

  @Put(':id')
  async updatePackage(
    @Param('id') id: string,
    @Body() updatePackageDto: CreatePackageDto,
  ) {
    try {
      const updatedPackage = await this.packagesService.updatePackage(
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

  @Delete(':id')
  async deletePackage(@Param('id') id: string) {
    try {
      return await this.packagesService.deletePackage(id);
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to delete package',
      };
    }
  }
}
