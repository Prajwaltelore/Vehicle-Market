import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ImagesDocument = Images & Document;

@Schema()
export class Images {
    @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    etag: string;

    @Prop({ required: true })
    file: string;

    @Prop({ required: true })
    url: string;
}

export const ImagesSchema = SchemaFactory.createForClass(Images);
