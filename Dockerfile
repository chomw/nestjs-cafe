# 1. Base Image: 가벼운 알파인(alpine) 버전의 Node.js를 사용합니다.
FROM node:24-alpine

# 2. 작업 디렉토리 설정: 컨테이너 내부에서 코드가 위치할 경로입니다.
WORKDIR /usr/src/app

# 3. 의존성 설치: package.json 파일을 먼저 복사하여 npm install을 진행합니다.
# (소스 코드보다 먼저 복사하면 Docker의 캐싱 기능을 활용해 빌드 속도가 빨라집니다.)
COPY package*.json ./
RUN npm install

# 4. 소스 코드 복사: 나머지 모든 프로젝트 파일을 컨테이너 안으로 복사합니다.
COPY . .

# 5. Nest.js 빌드: TypeScript 코드를 JavaScript로 컴파일합니다.
RUN npm run build

# 6. 포트 개방: 애플리케이션이 사용할 포트를 명시합니다. (기본 3000)
EXPOSE 3000

# 7. 실행 명령어: 빌드된 결과물을 실행합니다.
CMD ["npm", "run", "start:prod"]