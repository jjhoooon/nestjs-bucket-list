import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
    sub: string;
    username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-access-token',
) {
    constructor(private readonly configService: ConfigService) {
        // super 호출 전에 this에 접근하면 안 되므로 파라미터로 받은 configService를 직접 사용
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        console.log('AccessTokenStrategy constructor called, secret:', secret);
        if (!secret) {
            // 런타임에 환경변수가 없으면 명확한 오류를 던져 타입 불일치와 런타임 문제를 방지
            throw new Error(
                'JWT_ACCESS_TOKEN_SECRET must be configured in environment',
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // 이제 secret은 항상 string 이므로 타입 경고가 사라짐
            secretOrKey: secret,
            ignoreExpiration: false,
        });

        // 생성자 종료 후에 클래스 필드에 할당
        this.configService = configService;
    }

    validate(payload: JwtPayload) {
        return payload;
    }
}
