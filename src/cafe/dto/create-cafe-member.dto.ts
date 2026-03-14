import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class CreateCafeMemberDto {
  @Type(() => Number)
  @IsNumber({}, { message: '카페 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '카페 ID가 누락되었습니다.' })
  cafeId: number;

  @IsString()
  @IsNotEmpty({ message: '별명을 입력해주세요.' })
  @MaxLength(20, { message: '별명은 20자를 초과할 수 없습니다.' })
  nickname: string;

  // 프로필 이미지는 필수가 아니므로 Optional 처리
  @IsOptional()
  @IsString()
  profile_img?: string;
}