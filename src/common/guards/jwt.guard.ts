import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../server/v1/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException({
                status: false,
                message: 'Authorization token not found',
                data: null,
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Check if the token is blacklisted
        if (await this.userService.isTokenBlacklisted(token)) {
            throw new UnauthorizedException({
                status: false,
                message: 'Token has been blacklisted',
                data: null,
            });
        }

        try {
            const decoded = this.jwtService.verify(token);
            if(!decoded){
                throw new UnauthorizedException({
                    status: false,
                    message: 'Invalid token',
                    data: null,
                });
            }else{
                request.user = decoded;
                return true;
            }
        } catch (err) {
            throw new UnauthorizedException({
                status: false,
                message: 'Invalid token',
                data: null,
            });
        }
    }
}
