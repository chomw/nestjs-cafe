import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import hbs from 'hbs';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';
import { Logger, ValidationPipe } from '@nestjs/common';

function setupMvc(app: NestExpressApplication) {
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.set('view options', { layout: 'layouts/main-layout' });
    app.setViewEngine('hbs');
}

function registerHbsPartials() {

    const logger = new Logger('HbsSetup');
    const partialsDir = join(__dirname, '..', 'views', 'partials');

    if (!fs.existsSync(partialsDir)) {
        logger.error(`Partials 폴더를 찾을 수 없습니다: ${partialsDir}`);
        return;
    }

    const files = fs.readdirSync(partialsDir);
    for (const file of files) {
        if (file.endsWith('.hbs')) {
            const partialName = file.split('.')[0];
            const template = fs.readFileSync(join(partialsDir, file), 'utf8');
            hbs.registerPartial(partialName, template);
        }
    }
    
    logger.log(`Partials 폴더 등록 완료: ${partialsDir}`);
}

function registerHbsHelpers() {
    hbs.registerHelper('toISOString', (date: any) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return '';
        }

        // NOTE: Date.toISOString()를 쓰지 않는 이유는 dateObj가 이미 UTC이기 때문이다
        // T, Z만 잘 붙여준다
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}T${hh}:${min}Z`;
    });
}

function setupGlobals(app: NestExpressApplication) {
    app.use(cookieParser());
    app.useGlobalFilters(new NotFoundExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,                // DTO에 정의되지 않은 속성은 자동으로 제거 (보안 유지)
            forbidNonWhitelisted: true,     // DTO에 없는 속성이 들어오면 에러(400) 발생
            transform: true,                // 클라이언트가 보낸 데이터를 실제 DTO 객체로 자동 변환
        }),
    );
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    setupMvc(app);
    registerHbsPartials();
    registerHbsHelpers();
    setupGlobals(app);

    await app.listen(3000);
}

bootstrap();