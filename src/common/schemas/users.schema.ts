import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UsersDocument = Users &
  Document & {
    validatePassword(password: string): Promise<boolean>;
  };

@Schema({ timestamps: true })
export class Users {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    unique: true,
  })
  mobile: number;

  @Prop({
    required: true,
  })
  country_code: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: false,
    default:
      'https://png.pngtree.com/png-vector/20190704/ourmid/pngtree-vector-user-young-boy-avatar-icon-png-image_1538408.jpg',
  })
  avtar: string;

  @Prop({ required: false })
  provider: string;

  @Prop({ required: false })
  facebookId: string;

  @Prop({ required: false })
  googleId: string;

  @Prop({ default: false })
  mobile_verified: boolean;

  @Prop({ default: false })
  email_verified: boolean;

  @Prop()
  refresh_token: string;

  @Prop()
  token_expiry: Date;

  @Prop({ required: false, default: 0 })
  country: number;

  @Prop({ required: false, default: 0 })
  state: number;

  @Prop({ required: false, default: 0 })
  city: number;

  @Prop()
  last_ip: string;

  @Prop({ enum: ['active', 'inactive', 'blocked'], default: 'inactive' })
  status: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

// Hash password before saving
UsersSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Add validatePassword method
UsersSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
