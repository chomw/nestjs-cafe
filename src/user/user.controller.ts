import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { TransformInterceptor } from "src/common/interceptors/transform.interceptor";
import { HttpExceptionFilter } from "src/common/filters/http-exception.filter";

@Controller('api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(TransformInterceptor)
    @UseFilters(HttpExceptionFilter)
    async signUp(@Body() createUserDto: CreateUserDto) {
      return this.userService.signUp(createUserDto);
    }
}