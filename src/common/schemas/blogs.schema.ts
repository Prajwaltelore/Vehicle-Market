import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type BlogsDocument = Blogs & Document;

@Schema({ timestamps: true })
export class Blogs {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortdescription: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, unique: true })
  url_slug: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: false })
  status: boolean;

  @Prop({ default: false })
  deleted: boolean;

}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);

