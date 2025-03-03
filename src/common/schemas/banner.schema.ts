import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  image: string;

  @Prop({ default: false })
  status: boolean;

  @Prop({ default: false })
  deleted: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
