import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCafeDto {
    @IsString()
    @IsNotEmpty()
    name: string;       // 카페 이름 (필수)

    @IsString()
    @IsNotEmpty()       
    address: string;    // 카페 주소 (필수)

    @IsString()
    @IsOptional()
    icon_img?: string;  // 아이콘 (선택)

    @IsInt()
    @Min(0)
    @Max(2)
    @IsOptional()
    public_type?: number;   // 공개 설정 (선택)

    @IsString()
    @IsOptional()
    description?: string;   // 설명 (선택)
}