import { Controller, Get, Render, Param, Query, Redirect, Inject, UseGuards, Logger, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUser } from './auth/decorators/get-user.decorator';
import { SsrOptionalAuthGuard } from './auth/guards/ssr-optional-auth.guards';
import { CafeService } from './cafe/cafe.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CafePostService } from './cafe/cafe-post.service';

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
  getHome(@GetUser() user: any) {    
    
    // main.ts에서 기본값을 'layouts/main-layout'으로 주었기 때문에, 
    // 아무것도 안 넘겨도 자동으로 main-layout이 씌워집니다.
    return { 
      title: '카페 홈',
      isLogin: (!!user),
      user: user, 
      cafeList: [
        {
          name: "오랑's Essay in Atlanta",
          posts: [
            { postId: 1, title: '(260211)외환 시장, 극단의 동상이몽!', author: '오랑', date: '2026.02.11.' },
            { postId: 1, title: '(260210)엔 약세... 우주 방어!', author: '오랑', date: '2026.02.10.' },
            { postId: 1, title: '맨 앞에 서지 않는 법 - AI 시대', author: '게임개발자', date: '22시간 전' },
          ]
        },
        {
          name: "온라인서버제작자모임",
          posts: [
            { postId: 1, title: '맨 앞에 서지 않는 법 - AI 시대', author: '게임개발자', date: '22시간 전' },
            { postId: 1, title: '운영 피로도 없이 굴러가는 수익', author: '게임개발자', date: '2026.02.10.' },
          ]
        },
        {
          name: "오랑's Essay in Atlanta",
          posts: [
            { postId: 1, title: '(260211)외환 시장, 극단의 동상이몽!', author: '오랑', date: '2026.02.11.' },
            { postId: 1, title: '(260210)엔 약세... 우주 방어!', author: '오랑', date: '2026.02.10.' },
          ]
        },
        {
          name: "온라인서버제작자모임",
          posts: [
            { postId: 1, title: '맨 앞에 서지 않는 법 - AI 시대', author: '게임개발자', date: '22시간 전' },
            { postId: 1, title: '운영 피로도 없이 굴러가는 수익', author: '게임개발자', date: '2026.02.10.' },
          ]
        },
        {
          name: "오랑's Essay in Atlanta",
          posts: [
            { postId: 1, itle: '(260211)외환 시장, 극단의 동상이몽!', author: '오랑', date: '2026.02.11.' },
            { postId: 1, title: '(260210)엔 약세... 우주 방어!', author: '오랑', date: '2026.02.10.' },
            { postId: 1, title: '(260210)엔 약세... 우주 방어!', author: '오랑', date: '2026.02.10.' },
          ]
        }
      ]
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
  @Get('/cafe/create')
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

    // const recentPosts = await this.cafePostService.getRecentPosts(cafe.id);

    return {       
      layout: 'layouts/cafe-layout', 
      showSidebar: true,
      title: cafe.name,
      user,
      cafe
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

    const cafe = await this.cafeService.getCafeByAddress(address);

    // 카페가 존재하지 않으면 홈으로 이동
    if (!cafe) {
      return res.redirect('/home');
    }

    const post = await this.cafePostService.getPost(postId);

    if (!post) {
      return res.redirect('/home');
    }

    const member = await this.cafeService.getMember(post.userId);

    return {       
      layout: 'layouts/cafe-layout', 
      showSidebar: false,
      title: post.title,
      user,
      cafe,
      post,
      author: member
     }; 
  }
}
