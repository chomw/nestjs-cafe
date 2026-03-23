import { Controller, Get, Render, Param, Query, Redirect, Inject, UseGuards, Logger, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUser } from './auth/decorators/get-user.decorator';
import { SsrOptionalAuthGuard } from './auth/guards/ssr-optional-auth.guards';
import { CafeService } from './cafe/cafe.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CafePostService } from './cafe/cafe-post.service';
import { BusinessException } from './common/exceptions/business.exception';
import { ErrorCode } from './common/constants/error-code.constant';
import { CafeMember } from './cafe/entities/cafe-member.entity';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly cafeService: CafeService,
    private readonly cafePostService: CafePostService,
  ) { }

  @Get()
  @Redirect('/home', 302)
  getRoot() {

  }

  // 1. 카페 홈 (기본 레이아웃 적용)
  @UseGuards(SsrOptionalAuthGuard)
  @Get('/home')
  @Render('pages/home') // views/pages/home.hbs의 내용을 가져옴
  async getHome(@GetUser() user: any) {

    const cafeList = user ? await this.cafeService.getMyCafeList(user.id) : [];
    const recommendCafeList = await this.cafeService.getRecommendCafeList();

    const cafeIdSet = new Set();

    // 임시 배열 생성 없이 바로 Set에 ID만 쏙쏙 집어넣기
    for (const cafe of cafeList) cafeIdSet.add(cafe.cafeId);
    for (const cafe of recommendCafeList) cafeIdSet.add(cafe.cafeId);

    const cafeIds = Array.from(cafeIdSet) as number[];

    const postMap = cafeIds.length > 0 ? await this.cafePostService.getLatestPostsByCafeIds(cafeIds) : new Map();

    cafeList.forEach(cafeInfo => {
      const posts = postMap.get(cafeInfo.cafeId);
      cafeInfo.posts = posts;
    });

    recommendCafeList.forEach(cafeInfo => {
      const posts = postMap.get(cafeInfo.cafeId);
      cafeInfo.posts = posts;
    });

    const defaultTab = (cafeList.length <= 0 ? 'popular' : 'my');
    const isMyCafeActive = defaultTab === 'my';
    const isPopularActive = defaultTab === 'popular';

    this.logger.log('recommendCafeList: ' + JSON.stringify(recommendCafeList));

    // main.ts에서 기본값을 'layouts/main-layout'으로 주었기 때문에, 
    // 아무것도 안 넘겨도 자동으로 main-layout이 씌워집니다.
    return {
      title: '카페 홈',
      isLogin: (!!user),
      user: user,
      cafeList,
      recommendCafeList,
      isMyCafeActive,
      isPopularActive
    };
  }

  // 2. 회원가입 화면 (auth 레이아웃 덮어쓰기)
  @Get('/signup')
  @Render('pages/signup') // views/pages/signup.hbs의 내용을 가져옴
  getSignup() {
    return {
      // ⭐ 이 화면만 기본 레이아웃을 무시하고 signup-layout을 씌우라고 명령!
      layout: 'layouts/signup-layout',
      title: '회원가입'
    };
  }

  @Get('/login')
  @Render('pages/login')
  getLogin() {
    return {
      layout: 'layouts/login-layout',
      title: '로그인'
    };
  }

  @UseGuards(SsrOptionalAuthGuard)
  @Get('/create')
  @Render('pages/home_create')
  getCafeCreate(@GetUser() user: any) {
    return {
      user: user,
      title: '카페 만들기'
    };
  }

  @UseGuards(SsrOptionalAuthGuard)
  @Get('/cafe/:address')
  @Render('pages/cafe-home')
  async getCafeHome(
    @GetUser() user: any,
    @Param('address') address: string,
    @Res() res: Response
  ) {

    const cafe = await this.cafeService.getCafeByAddress(address);

    // 카페가 존재하지 않으면 홈으로 이동
    if (!cafe) {
      return res.redirect('/home');
    }

    const [member, postData] = await Promise.all([
      user ? this.cafeService.getMember(cafe.id, user.id) : null,
      this.cafePostService.getPostList(cafe.id)
    ]);

    return {
      layout: 'layouts/cafe-layout',
      showSidebar: true,
      title: cafe.name,
      user,
      cafe,
      postData,
      isMember: (!!member),
      member
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/cafe/:address/post/new')
  @Render('pages/cafe-post-create')
  async getCafePostCreate(
    @GetUser() user: any,
    @Param('address') address: string,
    @Res() res: Response
  ) {

    const cafe = await this.cafeService.getCafeByAddress(address);

    // 카페가 존재하지 않으면 홈으로 이동
    if (!cafe) {
      return res.redirect('/home');
    }

    return {
      layout: 'layouts/cafe-layout',
      showSidebar: false,
      title: '글쓰기',
      user,
      cafe
    };
  }

  @UseGuards(SsrOptionalAuthGuard)
  @Get('/cafe/:address/post/:postId')
  @Render('pages/cafe-post-detail')
  async getCafePostDetail(
    @GetUser() user: any,
    @Param('address') address: string,
    @Param('postId') postId: string,
    @Res() res: Response
  ) {

    // 서로 의존성이 없는 데이터는 Promise.all로 병렬 조회
    const [cafe, post, comments] = await Promise.all([
      this.cafeService.getCafeByAddress(address),
      this.cafePostService.getPost(postId),
      this.cafePostService.getCommentList(postId)
    ]);

    // 필수 리소스가 하나라도 없으면 빠르게 홈으로 돌려보냄 (Early Return)
    if (!cafe || !post) {
      return res.redirect('/home');
    }

    const author = await this.cafeService.getMember(cafe.id, post.userId);

    // 작성자가 카페 멤버가 아닌 경우 예외 처리
    if (!author) {
      throw new BusinessException(ErrorCode.NOT_CAFE_MEMBER, HttpStatus.FORBIDDEN);
    }

    return {
      layout: 'layouts/cafe-layout',
      showSidebar: false,
      title: post.title,
      user,
      cafe,
      post,
      author, 
      comments
    };
  }

  @UseGuards(SsrOptionalAuthGuard)
  @Get('/cafe/:address/join')
  @Render('pages/cafe-join')
  async getCafeJoin(
    @GetUser() user: any,
    @Param('address') address: string,
    @Res() res: Response
  ) {

    const cafe = await this.cafeService.getCafeByAddress(address);

    // 카페가 존재하지 않으면 홈으로 이동
    if (!cafe) {
      return res.redirect('/home');
    }

    return {
      layout: 'layouts/cafe-layout',
      showSidebar: true,
      title: cafe.name,
      user,
      cafe
    };
  }
}
