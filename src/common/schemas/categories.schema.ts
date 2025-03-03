import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoriesDocument = Categories & Document;

@Schema({ timestamps: true })
export class Categories {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    image: string;

    @Prop({ required: true })
    order: number;

    @Prop({ default: true })
    status: boolean;

    @Prop({ default: false })
    deleted: boolean;
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories);
