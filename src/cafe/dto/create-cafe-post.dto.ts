import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer'; // ✨ 문자열을 숫자로 변환하기 위해 임포트

export class CreateCafePostDto {
  // ✨ cafeId 추가
  @Type(() => Number) // 폼에서 넘어온 문자열 "1"을 숫자 1로 변환
  @IsNumber({}, { message: '카페 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '카페 ID가 누락되었습니다.' })
  cafeId: number;

  @IsString()
  @IsNotEmpty({ message: '제목을 입력해 주세요.' })
  @MaxLength(100, { message: '제목은 100자를 초과할 수 없습니다.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해 주세요.' })
  content: string;
}