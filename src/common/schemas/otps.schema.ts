import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpVerificationDocument = OtpVerification & Document & {
    isExpired: () => boolean; // Add isExpired method to the Document type
};

@Schema({ timestamps: true })
export class OtpVerification {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    otp: string;

    @Prop({ required: true, enum: ['sms', 'email'] })
    type: string;

    @Prop({ required: true, default: false })
    status: boolean;

    @Prop({ required: true, index: { expires: 0 } })
    expiry: Date;  // Add expiry property
}

export const OtpVerificationSchema = SchemaFactory.createForClass(OtpVerification);

// Define the isExpired method
OtpVerificationSchema.methods.isExpired = function () {
    if(this.type==='sms'){
        return new Date() > this.expiry;        
    }else{
        return false;
    }
};
