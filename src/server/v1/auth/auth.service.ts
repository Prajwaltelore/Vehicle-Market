import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from 'src/common/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<UsersDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateOAuthLogin(user: any): Promise<any> {
    const { email, provider, providerId, firstname, lastname } = user;

    let existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.googleId !== providerId) {
        existingUser.googleId = providerId;
        await this.userModel.findByIdAndUpdate(existingUser.id, {
          googleId: providerId,
        });
      }

      const tokens = this.generateTokens(existingUser);
      return { status: true, message: 'Login successful', tokens };
    } else {
      const newUser = await this.userModel.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        provider: provider,
        googleId: providerId,
        password: null, 
        email_verified: true, 
        mobile_verified: false,
      });

      const tokens = this.generateTokens(newUser);
      console.log(tokens);
      return { status: true, message: 'Registration successful', data: tokens };
    }
  }

  private generateTokens(user: any) {
    const payload = { id: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_secret'),
      expiresIn: this.configService.get('jwt_expiry'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('refresh_secret'),
      expiresIn: this.configService.get('jwt_refresh_expiry'),
    });

    this.userModel.findByIdAndUpdate(user._id, { refresh_token: refreshToken });

    return { accessToken, refreshToken };
  }
}
