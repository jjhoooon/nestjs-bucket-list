import {
    ConflictException,
    Injectable,
    NotAcceptableException,
} from '@nestjs/common';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ) {}

    async findAll(): Promise<Post[]> {
        return this.postRepository.find();
    }

    async findOne(id: number): Promise<Post | null> {
        const post = await this.postRepository.findOne({ where: { id } });
        return post;
    }

    async create(createPostDto: CreatePostDto): Promise<Post> {
        try {
            const post = this.postRepository.create(createPostDto);
            return await this.postRepository.save(post);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(
                    '해당 제목과 작성자를 가진 게시글이 이미 존재합니다.',
                );
            }
            throw error;
        }
    }

    async update(
        id: number,
        updatePostDto: UpdatePostDto,
    ): Promise<Post | null> {
        const result = await this.postRepository.update(id, updatePostDto);

        if (result.affected === 0) {
            throw new NotAcceptableException(
                `${id}번에 해당하는 게시글을 찾을 수 없습니다.`,
            );
        }
        return await this.postRepository.findOne({ where: { id } });
    }

    async remove(id: number): Promise<void> {
        const result = await this.postRepository.delete(id);
        if (result.affected === 0) {
            throw new NotAcceptableException(
                `${id}번에 해당하는 게시글을 찾을 수 없습니다.`,
            );
        }
    }
}
