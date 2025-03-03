import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MetadataDocument = Metadata & Document;

@Schema({ timestamps: true })
export class Metadata {
    @Prop()
    keyword: string;

    @Prop()
    description: string;
}

export const MetadataSchema = SchemaFactory.createForClass(Metadata);
