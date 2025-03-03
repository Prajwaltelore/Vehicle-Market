import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../../../common/notifications/notifications.service';
import { Users, UsersDocument } from '../../../common/schemas/users.schema';
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from '../../../common/schemas/blacklistedtoken.schema';

import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { Images, ImagesDocument } from 'src/common/schemas/images.schema';
import { UpdateProfilePictureDto } from './dtos/update-profile-picture.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { StreamName } from 'aws-sdk/clients/cognitosync';
import { VerifySmsDto } from './dtos/verify-sms.dto';
import { SendSmsDto } from './dtos/send-sms.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UsersDocument>,
    @InjectModel(BlacklistedToken.name)
    private readonly blacklistedTokenModel: Model<BlacklistedTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<any> {
    const { firstname, lastname, email, country_code, mobile, password } =
      signupDto;
    const userExists = await this.userModel.findOne({
      $or: [{ email }, { mobile }],
    });

    if (userExists) {
      return { status: false, message: 'User already exists', data: null };
    }

    const user = new this.userModel({
      firstname,
      lastname,
      email,
      country_code,
      mobile,
      password,
    });
    await user.save();

    if (user) {
      const mailVerificationToken = await this.generateEmailVerificationToken(
        user.email,
      );

      await this.notificationsService.sendOtp(user.mobile);
      await this.notificationsService.accountVerificationEmail(
        user.email,
        mailVerificationToken,
      );
      const payload = { mobile: user.mobile, sub: user._id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt_refresh_expiry'), // Token valid for 7 days
      });

      return {
        status: true,
        message: 'Signup successful',
        data: { user, accessToken, refreshToken },
      };
    } else {
      return {
        status: false,
        message: 'Signup failed',
        data: null,
      };
    }
  }

  async update(userId: string, updateDto: UpdateUserDto): Promise<any> {
    const { email } = updateDto;

    // if (email) {
    //   const emailExists = await this.userModel.findOne({ email: email });
    //   if (emailExists) {
    //     return {
    //       status: false,
    //       message: 'Email already exists',
    //     };
    //   }
    // }

    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true },
    );
    if (result) {
      return {
        status: true,
        message: 'User updated successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'User not updated',
        data: null,
      };
    }
  }

  async updateImage(id: string, image: String): Promise<any> {
    // console.log(uploadResult)
    // const imageData = {
    //   etag: uploadResult.etag,
    //   file: uploadResult.file,
    //   url: uploadResult.url,
    // };
    // const imageName = uploadResult.file.split('/').pop();
    return await this.userModel.findByIdAndUpdate(
      id,
      { avtar: image },
      { new: true },
    );
  }

  // remove user image
  async deleteImageById(userId: string): Promise<any> {
    try {
      const defaultPic =
        'https://png.pngtree.com/png-vector/20190704/ourmid/pngtree-vector-user-young-boy-avatar-icon-png-image_1538408.jpg';
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { avtar: defaultPic },
        { new: true },
      );

      if (!updatedUser) {
        return {
          status: false,
          message: 'User not found',
          data: null,
        };
      }

      return {
        status: true,
        message: 'Image deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error(`Error deleting image for user ${userId}:`, error);
      return {
        status: false,
        message: 'Failed to delete image',
        error: error.message,
      };
    }
  }

  async findById(id: string) {
    const result = await this.userModel.findById(id).exec();
    if (result) {
      return {
        status: true,
        message: 'User found successfully',
        data: result,
      };
    } else {
      return {
        status: false,
        message: 'User not found',
        data: null,
      };
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { mobile, password } = loginDto;
    const user = await this.userModel.findOne({ mobile: mobile });

    if (!user || !(await user.validatePassword(password))) {
      return {
        status: false,
        message: 'Invalid credentials',
        data: null,
      };
    }

    const payload = { mobile: user.mobile, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt_refresh_expiry'), // Token valid for 7 days
    });

    return {
      status: true,
      message: 'Login successful',
      data: { user, accessToken, refreshToken },
    };
  }

  async verifyAccount(mobile: number, type: string) {
    const user = await this.userModel.findOne({ mobile });

    if (!user) {
      return {
        status: false,
        message: 'User not found',
        data: null,
      };
    }

    if (type == 'email') {
      user.email_verified = true;
    } else if (type == 'sms') {
      user.mobile_verified = true;
      user.status = 'active';
    }

    await user.save();

    return {
      status: true,
      message: 'Account verified successfully',
      data: null,
    };
  }

  async sendForgetPasswordOtp(mobile: number) {
    const userExists = await this.userModel.findOne({ mobile });

    if (!userExists) {
      return { status: false, message: 'User not found', data: null };
    }
    await this.notificationsService.sendOtp(mobile);
    return { status: true, message: 'OTP sent successfully', data: null };
  }

  async changePassword(mobile: number, password: string) {
    const userExists = await this.userModel.findOne({ mobile });

    if (!userExists) {
      return { status: false, message: 'User not found', data: null };
    }

    userExists.password = password;
    await userExists.save();

    return {
      status: true,
      message: 'Password changed successfully',
      data: userExists,
    };
  }

  async logout(token: string): Promise<{ status: boolean; message: string }> {
    const decoded = this.jwtService.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    const expiresAt = new Date(decoded.exp * 1000); // Convert expiration to Date

    await this.blacklistedTokenModel.create({ token, expiresAt });

    return { status: true, message: 'Logged out successfully' };
  }

  // Check if the JWT token is blacklisted or expired
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.blacklistedTokenModel.findOne({ token });
    return !!blacklisted;
  }

  // Email verification token generation
  async generateEmailVerificationToken(email: string) {
    const payload = { email }; // Add more data if needed
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h', // Token valid for 1 hour
    });
    return token;
  }

  async verifyEmailToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    if (payload.email) {
      const user = await this.userModel.findOne({ email: payload.email });
      if (user) {
        user.email_verified = true;
        await user.save();
        return {
          status: true,
          message: 'Email verified successfully',
          data: null,
        };
      } else {
        return { status: false, message: 'User not found', data: null };
      }
    }
  }

  async authenticatedUser(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      const user = await this.userModel.findById(decoded.sub);

      if (!user) {
        return {
          status: false,
          message: 'User not found',
          data: null,
        };
      } else {
        return {
          status: true,
          message: 'User found',
          data: user,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        return {
          status: false,
          message: 'User not found',
          data: null,
        };
      }

      const payload = { mobile: user.mobile, sub: user._id };
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('jwt_expiry'),
      });
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt_refresh_expiry'),
      });

      return {
        status: true,
        message: 'Access token refreshed',
        data: {
          user,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'Invalid refresh token',
        data: null,
      };
    }
  }

  async loginBySms(dto: SendSmsDto) {
    const { country_code, mobile } = dto;

    const user = await this.userModel.find({
      mobile: mobile,
      country_code: country_code,
    });

    if (!user) {
      return {
        status: false,
        message: 'Invalid credentials',
        data: null,
      };
    }

    const result = await this.notificationsService.sendOtp(mobile);
    if (result) {
      return {
        status: true,
        message: 'OTP sent successfully',
      };
    }
    return {
      status: false,
      message: 'Failed to send OTP',
    };
  }

  async verifyBySms(dto: VerifySmsDto) {
    const { mobile, otp } = dto;

    const user = await this.userModel.findOne({ mobile: mobile });

    if (!user) {
      return {
        status: false,
        message: 'Invalid credentials',
        data: null,
      };
    }

    const result = this.notificationsService.validateOtp(mobile, otp);

    const payload = { mobile: user.mobile, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt_refresh_expiry'), // Token valid for 7 days
    });

    if (result) {
      return {
        status: true,
        message: 'Login successful',
        data: { user, accessToken, refreshToken },
      };
    } else {
      return {
        status: false,
        message: 'Login unsuccessful',
        data: null,
      };
    }
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      return null;
    }
    return user;
  }
}
