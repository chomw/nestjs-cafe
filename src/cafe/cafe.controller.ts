import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, UseFilters, UseInterceptors, UseGuards, Query, HttpStatus, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CafeService } from './cafe.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CreateCafePostDto } from './dto/create-cafe-post.dto';
import { CafePostService } from './cafe-post.service';
import { CreateCafeMemberDto } from './dto/create-cafe-member.dto';
import { SsrOptionalAuthGuard } from 'src/auth/guards/ssr-optional-auth.guards';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { ErrorCode } from 'src/common/constants/error-code.constant';
import { PaginationDefault } from './constants/cafe.constant';

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

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @UseFilters(HttpExceptionFilter)
  async join(
    @GetUser() user: any, 
    @Body() createCafeMemberDto: CreateCafeMemberDto) {
    return await this.cafeService.joinCafe(user.id, createCafeMemberDto);
  }

  @Get(':address/posts')
  @UseGuards(SsrOptionalAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @UseFilters(HttpExceptionFilter)
  async getPostList(
    @GetUser() user: any,
    @Param('address') address: string,
    @Query('page', new DefaultValuePipe(PaginationDefault.PAGE), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(PaginationDefault.LIMIT), ParseIntPipe) limit: number,
  ) {
    const cafe = await this.cafeService.getCafeByAddress(address);
    if (!cafe) {
      throw new BusinessException(ErrorCode.CAFE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this.cafePostService.getPostList(cafe.id, page, limit);
  }
}
