import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PackagesDocument = Packages & Document;

@Schema({ timestamps: true })
export class Packages {
  @Prop({ required: true, unique: true })
  package_name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, type: [String] })
  features: string[];

  @Prop({ required: true })
  duration: number;

  @Prop({ default: 0 })
  offer_discount: number;

  @Prop({ required: true })
  order: number;

  @Prop({ required: false, default: 'regular' })
  premium: string;

  @Prop({ enum: ['active', 'disabled'], default: 'disabled' })
  status: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const PackagesSchema = SchemaFactory.createForClass(Packages);
