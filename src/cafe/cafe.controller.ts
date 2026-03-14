import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, UseFilters, UseInterceptors, UseGuards } from '@nestjs/common';
import { CafeService } from './cafe.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CreateCafePostDto } from './dto/create-cafe-post.dto';
import { CafePostService } from './cafe-post.service';

@Controller('api/cafe')
export class CafeController {
  private readonly logger = new Logger(CafeController.name);

  constructor(
    private readonly cafeService: CafeService,
    private readonly cafePostService: CafePostService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @UseFilters(HttpExceptionFilter)
  create(@GetUser() user: any, @Body() createCafeDto: CreateCafeDto) {
    return this.cafeService.create(createCafeDto, user);
  }

  @Post('post')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @UseFilters(HttpExceptionFilter)
  async createPost(@GetUser() user: any, @Body() createCafePostDto: CreateCafePostDto) {

    const cafePost = await this.cafePostService.createPost(user.id, createCafePostDto);

    return { postId: cafePost.id };
  }
}
