import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Scope } from '@nestjs/common';
import { Strategy } from 'passport-facebook';
import { VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/v1/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name'],
      Scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    const { id, name, emails } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : null;
    const firstname = name?.givenName || 'Unknown';
    const lastname = name?.familyName || 'User';
    const user = {
      providerId: id,
      email: email,
      firstname: firstname,
      lastname: lastname,
      provider: 'facebook'
    };
    done(null, user);
  }
}
