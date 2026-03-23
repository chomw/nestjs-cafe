import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index
} from 'typeorm';

@Entity({ name: 'cafe_comment' })
@Index('idx_comment_post_id_created_at', ['postId', 'createdAt']) // 정렬까지 고려한 복합 인덱스
export class CafeComment {
  
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'PK (댓글 ID)' })
  id: string;

  @Column({ name: 'post_id', type: 'bigint', unsigned: true, comment: '게시글 ID' })
  postId: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, comment: '작성자 유저 ID' })
  userId: string;

  @Column({ type: 'text', comment: '댓글 내용' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', comment: '작성 일시' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', comment: '마지막 수정 일시' })
  updatedAt: Date;
  
  // Soft Delete (논리 삭제)
  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true, comment: '삭제 일시' })
  deletedAt: Date | null;    
}