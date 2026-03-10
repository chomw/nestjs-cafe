import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import hbs from 'hbs';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    app.useStaticAssets(join(__dirname, '..', 'public')); // 정적 파일 (css, js 등)
    app.setBaseViewsDir(join(__dirname, '..', 'views'));  // 템플릿 파일 위치
    
    app.use(cookieParser());

    app.set('view options', { layout: 'layouts/main-layout' });
    hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));        

    app.setViewEngine('hbs');

    await app.listen(3000);
}
bootstrap();