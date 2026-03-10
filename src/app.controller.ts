import { Controller, Get, Render, Param, Query, Redirect, Inject, UseGuards, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { GetUser } from './auth/decorators/get-user.decorator';
import { SsrOptionalAuthGuard } from './auth/guards/ssr-optional-auth.guards';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  @Get()
  @Redirect('/api/home', 302)
  getRoot() {
    
  }

  // 1. 카페 홈 (기본 레이아웃 적용)
  @UseGuards(SsrOptionalAuthGuard)
  @Get('/api/home')
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
          newPosts: 1,
          posts: [
            { title: '(260211)외환 시장, 극단의 동상이몽!', writer: '오랑', date: '2026.02.11.' },
            { title: '(260210)엔 약세... 우주 방어!', writer: '오랑', date: '2026.02.10.' },
          ]
        },
        {
          name: "온라인서버제작자모임",
          newPosts: 1,
          posts: [
            { title: '맨 앞에 서지 않는 법 - AI 시대', writer: '게임개발자', date: '22시간 전' },
            { title: '운영 피로도 없이 굴러가는 수익', writer: '게임개발자', date: '2026.02.10.' },
          ]
        }
      ]
     }; 
  }

  // 2. 회원가입 화면 (auth 레이아웃 덮어쓰기)
  @Get('/api/signup')
  @Render('pages/signup') // views/pages/signup.hbs의 내용을 가져옴
  getSignup() {
    return { 
      // ⭐ 이 화면만 기본 레이아웃을 무시하고 signup-layout을 씌우라고 명령!
      layout: 'layouts/signup-layout', 
      title: '회원가입' 
    };
  }

  @Get('/api/login')
  @Render('pages/login')
  getLogin() {    
    return {       
      layout: 'layouts/login-layout', 
      title: '로그인'
     }; 
  }

  @UseGuards(SsrOptionalAuthGuard)
  @Get('/api/create')
  @Render('pages/home_create')
  getCafeCreate(@GetUser() user: any) {    
    return { 
      user: user, 
      title: '카페 만들기'
     }; 
  }

  // @Get('redis-test')
  // async testRedis() {
  //   //await this.cacheManager.set('myKey', 'Hello Redis!', 10000);

  //   const value = await this.cacheManager.get('myKey');

  //   return {
  //     message: 'Redis 연결 완벽하게 성공!',
  //     dataFromRedis:value
  //   }
  // }
}
