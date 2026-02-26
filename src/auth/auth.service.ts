import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { User } from 'src/users/users.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async signUp(data: SignUpDto): Promise<any> {
        const existUser = await this.usersService.findByUsername(data.username);
        if (existUser) {
            throw new Error(`${data.username}은 이미 존재하는 사용자입니다.`);
        }

        const hashedPassword = await this.hashFn(data.password);
        const newUser = await this.usersService.create({
            ...data,
            password: hashedPassword,
        });

        const tokens = await this.getTokens(newUser);
        await this.updateRefreshToken(newUser.id, tokens.refreshToken);

        return tokens;
    }

    async signIn(data: SignInDto): Promise<any> {
        const user = await this.usersService.findByUsername(data.username);
        if (!user) {
            throw new BadRequestException('사용자를 찾을 수 없습니다.');
        }

        const isPasswordMatched = await argon2.verify(
            user.password,
            data.password,
        );
        if (!isPasswordMatched) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        const tokens = await this.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async signOut(userId: string): Promise<void> {
        await this.usersService.update(userId, {
            refreshToken: null,
        });
    }

    async refreshAllTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken) {
            throw new ForbiddenException('refresh token이 존재하지 않습니다.');
        }

        const isRefreshTokenMatched = await argon2.verify(
            user.refreshToken,
            refreshToken,
        );
        if (!isRefreshTokenMatched) {
            throw new ForbiddenException('refresh token이 일치하지 않습니다.');
        }

        const tokens = await this.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    private async hashFn(data: string): Promise<string> {
        return argon2.hash(data);
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await this.hashFn(refreshToken);
        await this.usersService.update(userId, {
            refreshToken: hashedRefreshToken,
        });
    }

    private async getTokens(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: user.id,
                    username: user.name,
                },
                {
                    secret: this.configService.get('JWT_ACCESS_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: user.id,
                    username: user.name,
                },
                {
                    secret: this.configService.get('JWT_REFRESH_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);
        return { accessToken, refreshToken };
    }
}

// 주요 기능
// signUp : 새 사용자 등록
// signIn : 사용자 로그인
// signOut : 사용자 로그아웃
// refreshAllTokens : 토큰 갱신
// getTokens: 액세스 토큰과 리프레시 토큰 생성
