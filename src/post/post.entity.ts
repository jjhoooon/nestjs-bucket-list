import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index('IDX_POST_TITLE', ['title'])
@Index('IDX_POST_AUTHOR_ID', ['authorId'])
@Index('IDX_POST_TITLE_AUTHOR_ID', ['title', 'authorId'])
export class Post {
    @PrimaryGeneratedColumn({
        type: 'int',
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    content: string;

    @Column({
        type: 'int',
        name: 'author_id',
        nullable: false,
    })
    authorId: number;
}
