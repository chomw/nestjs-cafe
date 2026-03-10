import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  login_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(255)
  password: string;

  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  profile_img?: string;

  @IsDateString()
  @IsOptional()
  birth?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone_num?: string;
}