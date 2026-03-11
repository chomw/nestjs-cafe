# ☕ Blue Cafe (네이버 카페 클론 프로젝트)

Blue Cafe는 네이버 카페와 같은 대규모 커뮤니티 플랫폼을 지향하는 백엔드 API 서버입니다. 
다수의 사용자가 활동하는 커뮤니티의 특성을 고려하여, **Nest.js**의 체계적인 아키텍처를 기반으로 일관된 에러 처리와 응답 규격을 설계했습니다. 특히 **Redis**와 **JWT**를 활용한 고도화된 인증/인가 시스템을 구축하여 서버의 보안과 세션 관리 안정성을 극대화하는 데 집중하고 있습니다.

### 🌐 Live Demo (운영 서버)
현재 AWS EC2와 GitHub Actions CI/CD 파이프라인을 통해 무중단 자동 배포되고 있는 테스트 서버입니다.
👉 **[Blue Cafe API 서버 접속하기](http://15.165.145.157/)**

*(💡 참고: 현재 활발하게 기능 개발 및 테스트가 진행 중인 서버이므로, 예고 없이 데이터가 초기화되거나 점검이 진행될 수 있습니다.)*

## 🛠 Tech Stack

- **Framework:** Nest.js (Node.js)
- **Language:** TypeScript
- **Database / ORM:** MySQL(TypeORM)
- **Cache / Session:** Redis (Docker 컨테이너 환경)
- **View Engine:** Handlebars (hbs)
- **Infra:** AWS EC2, Docker, GitHub Actions (CI/CD 자동화)

## 💡 Technical Background & Architecture

단순한 기능 구현을 넘어, 확장 가능하고 견고한 서버 인프라를 구축하기 위해 다음과 같은 아키텍처와 보안 파이프라인을 설계했습니다.

### 1. 고도화된 인증/인가 파이프라인 (JWT & Redis)
- **보안 인프라 구축:** Docker를 활용하여 세션 및 토큰 관리를 위한 Redis 컨테이너를 독립적으로 구축했습니다.
- **토큰 발급 및 검증:** 로그인 시 사용자 정보를 검증하고 Access Token 및 Refresh Token을 발급하는 핵심 로직을 구현했습니다.
- **RTR (Refresh Token Rotation) 도입:** 탈취 위험을 방지하기 위해 Redis를 활용한 RTR 방식을 적용하여 세션 보안을 한층 강화했습니다.
- **SSR 환경 보안 최적화:** 브라우저 환경에 맞춰 발급된 토큰을 HttpOnly 쿠키에 저장하도록 설정하여 XSS 공격을 선제적으로 방어하고 있습니다.
- **라이프사이클 관리:** 로그아웃 시 토큰 폐기 및 Access Token 만료 시 안전한 재발급(Refresh) 프로세스를 모두 구현하여 상태를 관리합니다.
- **가드(Guard)를 통한 선제적 제어:** `CanActivate` 인터페이스를 활용해 JWT 토큰 검증 로직을 가드에 연동했습니다. 이를 통해 컨트롤러의 핵심 로직이 실행되기 전, 사용자의 권한을 가장 먼저 안전하게 확인합니다.

### 2. 전역 응답 및 예외 처리 시스템 (Unified Response)
- **단일 응답 포맷:** API 호출 시 클라이언트가 일관된 형태의 데이터를 받을 수 있도록 `TransformInterceptor`를 구현했습니다. 성공적인 요청의 결괏값을 규격화된 성공 응답 객체로 깔끔하게 매핑합니다.
- **세분화된 예외 처리:** 커스텀 예외 클래스를 도입하고, 프론트엔드와 명확하게 소통할 수 있도록 에러 코드 체계를 구축했습니다. 전역 예외 필터(`HttpExceptionFilter`)를 적용하여 발생하는 모든 에러를 가로채고 규격화된 에러 응답 객체로 변환합니다.
- **데코레이터 컨벤션 확립:** 컨트롤러 단에서 `@UseGuards`, `@UseInterceptors`, `@UseFilters`의 실행 순서와 배치 컨벤션을 확립하여 의도한 파이프라인대로 정확히 작동하도록 구성했습니다.

### 3. MVC 패턴 공존 및 서버 환경 설정
- **API와 SSR의 섬세한 분리:** 화면을 그리는 렌더링 요청(SSR)과 순수 데이터 요청(API)이 충돌하지 않도록, 요청 URL이 `/api`로 시작하는 경우에만 인터셉터와 예외 필터가 작동하도록 처리 범위를 분리했습니다.
- **안전한 환경 변수 주입:** `.env` 파일을 도입하여 데이터베이스 연결 정보나 JWT 시크릿 키 등 민감한 정보를 안전하게 분리했습니다. Nest.js의 `ConfigService`를 활용해 애플리케이션 전반에서 타입 안전하게 환경 변수를 주입받습니다.
- **상수(Constants) 모듈화:** 프로젝트 전반에 사용되는 공통 값들을 상수화하고 별도의 폴더로 분리하여 코드의 유지보수성과 가독성을 높였습니다.

### 4. 무중단 CI/CD 자동화 파이프라인 (Docker & GitHub Actions)
- **Docker 기반 인프라 격리:** 애플리케이션(Nest.js), 데이터베이스(MySQL), 캐시(Redis)를 각각의 Docker 컨테이너로 분리 및 `docker-compose`로 묶어 로컬과 운영 서버(운영체제) 간의 환경 불일치 문제를 원천 차단했습니다.
- **GitHub Actions 기반 자동 배포:** `main` 브랜치에 코드가 푸시(Push)되면 즉각적으로 AWS EC2 서버로 소스 코드를 전송하고, 도커 컨테이너를 재빌드(`up --build -d`)하는 무중단 배포 워크플로우(`.yml`)를 구축했습니다.
- **보안 격리:** AWS EC2 보안 그룹(Security Group)을 통해 데이터베이스 직접 접근을 차단하고, 배포에 필요한 마스터키(`.pem`)와 서버 정보는 GitHub Secrets에 안전하게 암호화하여 보관합니다.

## 📌 Core Features (구현 중)

- **카페 비즈니스 로직 뼈대:** 카페 생성, 멤버 관리, 게시글 작성을 처리하기 위한 기본적인 서비스 레이어와 뼈대를 구축했습니다.
- **핵심 데이터베이스 모델링:** `cafe` 테이블의 뼈대가 되는 핵심 컬럼(카페 이름, 주소, 공개 여부(`public_type`), 회원 수(`member_count`) 등)의 데이터베이스 구조 설계를 완료했습니다.
- **SSR 레이아웃:** Nest.js 기반에 Handlebars(hbs) 템플릿 엔진을 연동하여 SSR 환경의 기본 뷰 레이아웃 구성을 마쳤습니다.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 이상 권장)
- MySQL
- Redis

### Installation

```bash
# 저장소 클론
$ git clone https://github.com/chomw/nestjs-cafe.git

# 패키지 설치
$ npm install

```

### Environment Variables

프로젝트 루트 폴더에 `.env` 파일을 생성하고 다음 환경 변수를 설정해주세요.
(참고: 보안상 `.env` 파일은 Github에 업로드되지 않습니다.)

```env
# DB Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cafe_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key

```

### Running the app (Docker Compose 환경)

```bash
# Nest.js, MySQL, Redis 컨테이너 일괄 실행 (백그라운드)
$ docker-compose up -d

# 컨테이너 종료
$ docker-compose down

```

### Running the app (Local 환경)

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## 📂 Project Structure

```text
src/
├── app.module.ts
├── auth/         # 인증/인가 (JWT 등)
├── cafe/         # 카페 기능 (생성, 가입, 글쓰기 등)
├── common/       # 전역 필터, 인터셉터, 커스텀 데코레이터
├── redis/        # 레디스
└── user/         # 사용자 정보 관리

```
