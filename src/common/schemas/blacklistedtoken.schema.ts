import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class BlacklistedToken {
    @Prop({ required: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;
}

export type BlacklistedTokenDocument = HydratedDocument<BlacklistedToken>;

export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedToken);

// Add a TTL index for automatic expiration
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
