import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,Schema as MongooseSchema } from 'mongoose';

export type BrandsDocument = Brands & Document;

@Schema({ timestamps: true })
export class Brands {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Categories', required: true })
    category: string;

    @Prop({ required: true })
    logo: string;

    @Prop({ default: true })
    status: boolean;

    @Prop({ default: false })
    deleted: boolean;
}

export const BrandsSchema = SchemaFactory.createForClass(Brands);
