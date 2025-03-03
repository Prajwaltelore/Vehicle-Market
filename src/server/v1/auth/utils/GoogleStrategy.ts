import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    const { id, name, emails } = profile;
    const firstname = name?.givenName || 'Unknown';
    const lastname = name?.familyName || 'User';
    const user = {
      providerId: id,
      email: emails[0].value,
      firstname: firstname,
      lastname: lastname,
      provider: 'google',
    };
    done(null, user);
  }
}
