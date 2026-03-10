import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'user', comment: '회원 정보 테이블' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'PK' })
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '로그인 ID (유니크)' })
  login_id: string;

  @Column({ type: 'varchar', length: 255, comment: '비밀번호 (암호화)' })
  password: string;

  @Column({ type: 'varchar', length: 255, comment: '이메일' })
  email: string;

  @Column({ type: 'varchar', length: 50, comment: '이름' })
  name: string;

  @Column({ type: 'varchar', length: 30, comment: '닉네임 (활동명)' })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '프로필 이미지 URL' })
  profile_img: string | null;

  @Column({ type: 'datetime', nullable: true, comment: '생년월일' })
  birth: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '전화번호' })
  phone_num: string | null;
}