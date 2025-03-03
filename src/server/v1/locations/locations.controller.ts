import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Locations & Address Controller')
@Controller('v1/locations')
export class LocationsController {
  constructor(private readonly locationService: LocationsService) {}

  @Get('countries')
  async getAllCountries() {
    return await this.locationService.getAllCountries();
  }

  @Get('states/:countryId')
  async getStatesByCountryId(@Param('countryId') countryId: number) {
    return await this.locationService.getStatesByCountryId(countryId);
  }

  @Get('cities/:stateId')
  async getCitiesByStateId(@Param('stateId') stateId: number) {
    return await this.locationService.getCitiesByStateId(stateId);
  }

  //   @Post('countries')
  //   async createCountries(@Body() createCountryDto: CreateCountriesDto) {
  //     return await this.locationService.createCountries(createCountryDto);
  //   }

  //   @Post('states')
  //   async createStates(@Body() createStateDto: CreateStatesDto) {
  //     return await this.locationService.createStates(createStateDto);
  //   }

  //   @Post('cities')
  //   async createCities(@Body() createCityDto: CreateCitiesDto) {
  //     return await this.locationService.createCities(createCityDto);
  //   }
}
