import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'test',
            password: process.env.DB_PASSWORD || 'test',
            database: process.env.DB_DATABASE || 'inflearn',
            autoLoadEntities: true,
            synchronize: true,
        }),
        PostModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {} // 개발 환경에서만 사용, 운영 환경에서는 false로 설정
