import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token',
) {
    constructor(private readonly configService: ConfigService) {
        const secret = configService.get<string>('JWT_REFRESH_SECRET');
        if (!secret) {
            throw new Error(
                'JWT_REFRESH_TOKEN_SECRET must be configured in environment',
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
        this.configService = configService;
    }

    validate(req: Request, payload: { sub: string; email: string }) {
        const authHeader =
            (typeof req.get === 'function' && req.get('authorization')) ||
            (req.headers && req.headers.authorization);

        if (!authHeader || typeof authHeader !== 'string') {
            throw new UnauthorizedException('권한 헤더가 없습니다.');
        }
        const refreshToken = authHeader.replace('Bearer', '').trim();
        return { ...payload, refreshToken };
    }
}
