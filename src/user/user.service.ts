import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import bcrypt from "node_modules/bcryptjs";
import { BusinessException } from "src/common/exceptions/business.exception";
import { ErrorCode } from "src/common/constants/error-code.constant";
import { ErrorMessageMap } from "src/common/constants/error-message.constant";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async signUp(CreateUserDto: CreateUserDto): Promise<{ message: string; userId: string }> {
    const { login_id, password, ...rest } = CreateUserDto;

    // 1. 로그인 ID 중복 검사
    const existingUser = await this.userRepository.findOne({ where: { login_id } });
    if (existingUser) {
      throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
    }

    // 2. 비밀번호 암호화 (Salt Rounds: 10) 
    // Salt Rounds: 10은 비밀번호를 암호화(해싱)할 때 연산을 얼마나 많이 반복할 것인가(Cost Factor)를 결정하는 설정값
    // Round가 10인 경우: 2^10 = 1,024번의 해싱 연산
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    // 3. 유저 객체 생성 및 저장
    const newUser = this.userRepository.create({
      login_id,
      password: hashedPassword,
      ...rest,
    });

    const savedUser = await this.userRepository.save(newUser);
    return {
      message: '회원가입이 성공적으로 완료되었습니다.',
      userId: savedUser.id
    };
  }

  async findByLoginId(login_id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { login_id }});
  }
}