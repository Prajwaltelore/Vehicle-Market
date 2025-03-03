import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ContactDetailsDocument = ContactDetails & Document;

@Schema()
export class ContactDetails {
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() })
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, enum: ['owner', 'agent', 'other'] })
    owner_type: string;

    @Prop({ required: true })
    person_name: string;

    @Prop({ required: true })
    mobile: string;

    @Prop({ required: true })
    whatsapp: boolean; // true/false
}

export const ContactDetailsSchema = SchemaFactory.createForClass(ContactDetails);
