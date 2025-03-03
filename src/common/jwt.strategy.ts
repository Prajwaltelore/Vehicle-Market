import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../server/v1/users/users.service';

@Injectable()
export class JwtStrategy extends AuthGuard('jwt') {
    constructor(private readonly configService: ConfigService, private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt_secret'),
        });
    }

    // async validate(payload: any) {
    //     return { userId: payload.sub, mobile: payload.mobile };
    // }

    async validate(payload: any) {
        // Example: Enrich the payload with user data from the database
        const user = await this.usersService.findById(payload.id);
        if (!user) {
            throw new UnauthorizedException({
                status: false,
                message: 'Invalid token',
                data: null
            });
        }
        return user; // This will attach the full user object to req.user
    }
}
