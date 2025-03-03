import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Countries,
  CountriesDocument,
} from '../../../common/schemas/countries.schema';
import { States, StatesDocument } from '../../../common/schemas/states.schema';
import { Cities, CitiesDocument } from '../../../common/schemas/cities.schema';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Countries.name)
    private countriesModel: Model<CountriesDocument>,
    @InjectModel(States.name) private statesModel: Model<StatesDocument>,
    @InjectModel(Cities.name) private citiesModel: Model<CitiesDocument>,
  ) {}

  async getAllCountries() {
    let data = await this.countriesModel.find().select('id name phone_code').sort({ name: 1 }).exec();
    if (data) {
      return {
        status: true,
        message: 'Countries fetched successfully',
        data: data,
      };
    } else {
      return {
        status: false,
        message: 'Countries not found',
        data: null,
      };
    }
  }

  async getStatesByCountryId(countryId: number) {
    let data = await this.statesModel.find({ country_id: countryId }).exec();
    if (data) {
      return {
        status: true,
        message: 'States fetched successfully',
        data: data,
      };
    } else {
      return {
        status: false,
        message: 'States not found',
        data: null,
      };
    }
  }

  async getCitiesByStateId(stateId: number) {
    let result = await this.citiesModel.find({ state_id: stateId }).exec();

    if (result) {
      return {
        status: true,
        message: 'Cities fetched successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'Cities not found',
        data: null,
      };
    }
  }

//   async createCountries(createCountryDto: CreateCountriesDto): Promise<any> {
//     const countries = new this.countriesModel(createCountryDto);
//     const result = await countries.save();
//     if (result) {
//       return {
//         status: true,
//         message: 'Countries created successfully',
//         data: result,
//       };
//     } else {
//       return {
//         status: false,
//         message: 'Countries not created',
//         data: null,
//       };
//     }
//   }

//   async createStates(createStateDto: CreateStatesDto): Promise<any> {
//     const states = new this.statesModel(createStateDto);
//     const result = await states.save();
//     if (result) {
//       return {
//         status: true,
//         message: 'States created successfully',
//         data: result,
//       };
//     } else {
//       return {
//         status: false,
//         message: 'States not created',
//         data: null,
//       };
//     }
//   }

//   async createCities(createCityDto: CreateCitiesDto): Promise<any> {
//     const cities = new this.citiesModel(createCityDto);
//     const result = await cities.save();
//     if (result) {
//       return {
//         status: true,
//         message: 'Cities created successfully',
//         data: result,
//       };
//     } else {
//       return {
//         status: false,
//         message: 'Cities not created',
//         data: null,
//       };
//     }
//   }
}
