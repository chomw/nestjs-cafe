import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import hbs from 'hbs';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, '..', 'public')); // 정적 파일 (css, js 등)
    app.setBaseViewsDir(join(__dirname, '..', 'views'));  // 템플릿 파일 위치

    app.use(cookieParser());

    app.set('view options', { layout: 'layouts/main-layout' });

    const partialsDir = join(__dirname, '..', 'views', 'partials');

    if (fs.existsSync(partialsDir)) {
        fs.readdirSync(partialsDir).forEach((file) => {
            if (file.endsWith('.hbs')) {
                // 파일명에서 확장자를 제외한 이름(예: 'cafe-header') 추출
                const partialName = file.split('.')[0];
                // 파일의 텍스트 내용을 동기적으로 읽어오기
                const template = fs.readFileSync(join(partialsDir, file), 'utf8');
                // hbs 엔진에 1:1로 직접 꽂아줌
                hbs.registerPartial(partialName, template);
            }
        });
        console.log(`[HBS] Partials 폴더 등록 완료: ${partialsDir}`);
    } else {
        console.error(`[HBS 에러] Partials 폴더를 찾을 수 없습니다: ${partialsDir}`);
    }

    hbs.registerHelper('formatDate', (dateObj) => {
        if (!dateObj) return '';

        const d = new Date(dateObj);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    });

    hbs.registerHelper('formatDateOnly', function (dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    app.setViewEngine('hbs');
    app.useGlobalFilters(new NotFoundExceptionFilter());

    await app.listen(3000);
}
bootstrap();