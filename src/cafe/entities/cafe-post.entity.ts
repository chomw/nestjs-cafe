import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index
} from 'typeorm';

// TypeORM 0.3.x 에서는 DESC 인덱스를 데코레이터로 직접 생성하기 어렵기 때문에 아래 인덱스를 수동으로 추가하자.
// CREATE INDEX idx_cafe_id_created_at_desc ON cafe_post (cafe_id ASC, created_at DESC);

@Entity({ name: 'cafe_post' })
export class CafePost {
    
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'PK (게시글 ID)' })
  id: string;

  @Column({ name: 'cafe_id', type: 'int', unsigned: true, comment: '카페 ID' })
  cafeId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '작성자 유저 ID' })
  userId: string;

  @Column({ type: 'varchar', length: 100, comment: '게시글 제목' })
  title: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 255, nullable: true, comment: '대표 이미지 URL' })
  thumbnailUrl: string | null;

  // 에디터 HTML 저장을 고려해 text 타입으로 개선
  @Column({ type: 'text', comment: '게시글 내용 (HTML)' })
  content: string;

  @Column({ name: 'view_count', type: 'int', unsigned: true, default: 0, comment: '조회수' })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', unsigned: true, default: 0, comment: '좋아요 수' })
  likeCount: number;

  // 목록 조회를 위한 역정규화 컬럼 추가
  @Column({ name: 'comment_count', type: 'int', unsigned: true, default: 0, comment: '댓글 수' })
  commentCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', comment: '작성 일시' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', comment: '마지막 수정 일시' })
  updatedAt: Date;

  // Soft Delete를 위한 컬럼 추가
  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true, comment: '삭제 일시' })
  deletedAt: Date | null;
}