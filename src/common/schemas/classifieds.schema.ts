import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { Metadata, MetadataSchema } from './metdata.schema';
import { Images, ImagesSchema } from './images.schema'; // Import the Image schema
import { ContactDetails, ContactDetailsSchema } from './contactdetails.schema';

export type ClassifiedsDocument = Classifieds & Document;

@Schema({ timestamps: true })
export class Classifieds {
    @Prop({ required: true })
    title: string;

    @Prop({ required: false, default: '' })
    url_slug: string;

    @Prop({ required: false, default: '' })
    shortcode: string;

    @Prop({ required: false, default: '' })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Categories', required: true })
    category: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Brands', required: true })
    brand: string;

    @Prop({ required: true })
    model: string;

    @Prop({ required: true })
    manufactur_year: number;

    @Prop({ required: true })
    kms_driven: number;

    @Prop({ required: true, enum: ['sell', 'rent'] })
    classified_type: string;

    @Prop({ required: false, default: '' })
    rental_unit: string;

    @Prop({ required: false, enum: ['regular', 'premium', 'featured', 'gold'], default: 'regular' })
    classified_badge: string;

    @Prop({ required: false, default: 0 })
    views: number;

    @Prop({ required: false})
    viewedBy: [String];

    @Prop({ required: false, default: 0 })
    likes: number;

    @Prop({ required: false})
    likedBy: [String];

    @Prop({ required: true})
    user: String;

    @Prop({ type: ContactDetailsSchema })
    contact_details: ContactDetails;

    @Prop({ required: true })
    country: number;

    @Prop({ required: true })
    state: number;

    @Prop({ required: true })
    city: number;

    @Prop({ required: true })
    address: string;

    @Prop({
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
    })
    location: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };

    @Prop({ required: false, type: [ImagesSchema], default: [] })
    images: Images[];

    @Prop({ required: false, type: MetadataSchema })
    meta: Metadata;

    @Prop({
        type: {
            submission_date: { type: Date, required: false },
            activation_date: { type: Date, required: false },
            expiry_date: { type: Date, required: false },
            approver_id: { type: String, required: false },
        },
        _id: false, // Prevent Mongoose from creating a separate `_id` for this object
    })
    subscription: {
        submission_date: Date;
        activation_date: Date;
        expiry_date: Date;
        approver_id: string;
    };

    @Prop({ required: false, enum: ['draft', 'inprocess', 'active', 'expired', 'trash', 'sold', 'rejected'], default: 'draft' })
    status: string;

    @Prop({ default: false })
    deleted: boolean;

}

export const ClassifiedsSchema = SchemaFactory.createForClass(Classifieds);
