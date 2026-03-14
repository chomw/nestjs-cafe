import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    Unique
} from 'typeorm';
import { CafeMemberStatus, CafeMemberLevel } from '../constants/cafe-member.constant';

@Entity({ name: 'cafe_member' })
@Unique('uk_cafe_user', ['cafeId', 'userId'])
@Unique('uk_cafe_nickname', ['cafeId', 'nickname'])
@Index('idx_cafe_status_visit', ['cafeId', 'status', 'lastVisitDate'])
@Index('idx_cafe_status_join', ['cafeId', 'status', 'joinDate'])
export class CafeMember {

    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'PK' })
    id: string;

    @Column({ name: 'cafe_id', type: 'int', unsigned: true, comment: '카페 ID' })
    cafeId: number;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '유저 ID' })
    userId: string;

    @Column({ name: 'nickname', length: 20, comment: '카페별 닉네임' })
    nickname: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: '프로필 이미지 URL' })
    profile_img: string | null;

    @Column({
        type: 'tinyint',
        unsigned: true,
        default: CafeMemberLevel.ASSOCIATE,
        comment: '10:매니저, 9:부매니저, 2:정회원, 1:준회원, 0:가입 대기'
    })
    level: CafeMemberLevel;

    @Column({
        type: 'tinyint',
        unsigned: true,
        default: CafeMemberStatus.PENDING,
        comment: '0:활동중, 1:대기, 2:탈퇴, 3:차단'
    })
    status: CafeMemberStatus;

    @Column({ name: 'visit_count', type: 'int', unsigned: true, default: 0, comment: '방문 수' })
    visitCount: number;

    @Column({ name: 'article_count', type: 'int', unsigned: true, default: 0, comment: '작성 글 수' })
    articleCount: number;

    @Column({ name: 'comment_count', type: 'int', unsigned: true, default: 0, comment: '작성 댓글 수' })
    commentCount: number;

    @CreateDateColumn({ name: 'join_date', type: 'datetime', comment: '가입 일시' })
    joinDate: Date;

    @Column({ name: 'leave_date', type: 'datetime', nullable: true, comment: '탈퇴 일시' })
    leaveDate: Date | null;

    @Column({
        name: 'last_visit_date',
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        comment: '마지막 방문 일시'
    })
    lastVisitDate: Date;
}