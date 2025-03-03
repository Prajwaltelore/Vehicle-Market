import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountriesDocument = Countries & Document;

@Schema({ timestamps: false })
export class Countries {
    @Prop({ required: true })
    id: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    iso3: string;

    @Prop({ required: true })
    iso2: string;

    @Prop({ required: true })
    numeric_code: string;

    @Prop({ required: true })
    phone_code: string;

    @Prop({ required: true })
    currency: string;

    @Prop({ required: true })
    currency_name: string;

    @Prop({ required: true })
    currency_symbol: string;

    @Prop({ required: true })
    latitude: string;

    @Prop({ required: true })
    longitude: string;

    @Prop({ required: true })
    emoji: string;

    @Prop({ required: true })
    emojiU: string;
}

export const CountriesSchema = SchemaFactory.createForClass(Countries);
