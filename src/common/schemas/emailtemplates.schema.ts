import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailTemplatesDocument = EmailTemplates & Document;

@Schema({ timestamps: true })
export class EmailTemplates {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    body: string;

    @Prop({ required: true })
    type: Boolean;

}

export const EmailTemplatesSchema = SchemaFactory.createForClass(EmailTemplates);
