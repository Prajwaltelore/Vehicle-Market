import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { Countries, CountriesSchema } from '../../../common/schemas/countries.schema';
import { States, StatesSchema } from '../../../common/schemas/states.schema';
import { Cities, CitiesSchema } from '../../../common/schemas/cities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Countries.name, schema: CountriesSchema },
      { name: States.name, schema: StatesSchema },
      { name: Cities.name, schema: CitiesSchema },
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
