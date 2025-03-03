import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CitiesDocument = Cities & Document;

@Schema({ timestamps: false })
export class Cities {
    @Prop({ required: true })
    id: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    state_id: number;

    @Prop({ required: true })
    state_name: string;

    @Prop({ required: true })
    state_code: string;

    @Prop({ required: true })
    country_id: number;

    @Prop({ required: true })
    country_name: string;

    @Prop({ required: true })
    country_code: string;

    @Prop({ required: true })
    latitude: string;

    @Prop({ required: true })
    longitude: string;

}

export const CitiesSchema = SchemaFactory.createForClass(Cities);
