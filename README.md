# ☕ Blue Cafe (대규모 커뮤니티 백엔드 시스템)

Blue Cafe는 네이버 카페의 비즈니스 모델을 모티브로 한 대규모 커뮤니티 플랫폼 백엔드 서버입니다.

이 프로젝트는 단순한 서비스 클론을 넘어, **현대적인 백엔드 기술 스택을 도입하고 이를 실무 수준의 아키텍처로 완벽하게 엮어내는 것**을 최우선 목표로 삼고 있습니다. 다수의 사용자가 활발하게 상호작용하는 커뮤니티의 특성을 고려하여, **Nest.js의 체계적이고 객체지향적인 아키텍처**를 기반으로 견고한 시스템 뼈대를 구축했습니다.

특히 단순 기능 구현에 머물지 않고 다음과 같은 인프라 및 성능 고도화에 집중하여 각 기술의 도입 목적을 훌륭하게 달성해 내고 있습니다.

* **보안 및 상태 관리:** Redis와 JWT를 활용한 고도화된 세션(RTR) 및 인증/인가 파이프라인
* **대용량 데이터 처리:** 커버링 인덱스 설계, N+1 쿼리 해결 및 In-Memory 캐싱을 통한 데이터베이스 성능 튜닝
* **미디어 최적화:** AWS S3, CloudFront, Sharp를 연동한 확장 가능한 이미지 업로드 및 리사이징 파이프라인
* **DevOps 환경:** Docker 기반의 인프라 격리와 GitHub Actions를 통한 CI/CD 무중단 자동 배포

### 🌐 Live Demo (운영 서버)

현재 AWS EC2와 GitHub Actions CI/CD 파이프라인을 통해 무중단 자동 배포되고 있는 테스트 서버입니다.


👉 **[Blue Cafe API 서버 접속하기](http://nestjscafe.com/)**

*(💡 참고: 현재 활발하게 기능 개발 및 테스트가 진행 중인 서버이므로, 예고 없이 데이터가 초기화되거나 점검이 진행될 수 있습니다.)*

## 🛠 Tech Stack

* **Framework:** Nest.js (Node.js)
* **Language:** TypeScript
* **Database / ORM:** MySQL(TypeORM)
* **Cache / Session:** Redis (Docker 컨테이너 환경), In-Memory Cache
* **View Engine:** Handlebars (hbs)
* **Infra / DevOps:** AWS EC2, AWS S3, CloudFront, Route 53, Docker, GitHub Actions (CI/CD)

## 💡 Technical Background & Architecture

단순한 기능 구현을 넘어, 확장 가능하고 견고한 서버 인프라를 구축하기 위해 다음과 같은 아키텍처와 성능 최적화 파이프라인을 설계했습니다.

### 1. 데이터베이스 성능 튜닝 및 캐싱 전략 (Performance)

* **커버링 인덱스(Covering Index) 적용:** 사용자가 가입한 '내 카페 목록' 조회 시 데이터베이스 디스크 I/O를 최소화하기 위해 복합 인덱스(`idx_user_status_visit`)를 설계 및 적용하여 검색 속도를 극대화했습니다.
* **N+1 문제 해결:** 메인 피드의 최신 게시글 목록을 불러올 때 발생하는 N+1 쿼리 문제를 QueryBuilder의 `LEFT JOIN`을 활용한 연관 객체 병합 로직으로 해결했습니다.
* **In-Memory 캐싱 도입:** 데이터베이스 부하를 줄이기 위해, 조회 빈도가 높고 실시간성이 상대적으로 낮은 '인기 카페 추천 목록' API에 10분 단위의 In-Memory 캐싱을 적용하여 응답 속도를 대폭 개선했습니다.

### 2. 고도화된 인증/인가 파이프라인 (JWT & Redis)

* **RTR (Refresh Token Rotation) 도입:** 탈취 위험을 방지하기 위해 Redis를 활용한 RTR 방식을 적용하여 세션 보안을 한층 강화했습니다.
* **SSR 환경 보안 최적화:** 브라우저 환경에 맞춰 발급된 토큰을 HttpOnly 쿠키에 저장하도록 설정하여 XSS 공격을 선제적으로 방어하고 있습니다.
* **가드(Guard)를 통한 선제적 제어:** `CanActivate` 인터페이스를 활용해 JWT 토큰 검증 로직을 가드에 연동하여, 컨트롤러의 핵심 로직이 실행되기 전 사용자의 권한을 가장 먼저 안전하게 확인합니다.

### 3. 대용량 미디어 처리 파이프라인 (AWS S3 & CloudFront)

* **S3 + CDN 인프라 연동:** `@aws-sdk/client-s3`를 활용하여 사용자 프로필 및 카페 아이콘 이미지를 S3 버킷에 안전하게 업로드하고, CloudFront를 통해 전역적으로 빠르게 서빙합니다.
* **서버사이드 이미지 리사이징:** 대용량 원본 이미지가 그대로 올라가는 것을 방지하기 위해 `sharp` 라이브러리를 도입, 서버 단에서 이미지를 최적화 규격으로 리사이징하여 스토리지 비용과 네트워크 대역폭을 절감합니다.

### 4. 전역 응답 및 예외 처리 시스템 (Unified Response)

* **단일 응답 포맷:** `TransformInterceptor`를 구현하여 API 호출 시 클라이언트가 규격화된 성공 응답 객체를 받을 수 있도록 매핑합니다.
* **세분화된 예외 처리:** 커스텀 예외 클래스(예: `FILE_NOT_PROVIDED`)를 도입하고, 전역 예외 필터(`HttpExceptionFilter`)를 통해 발생하는 모든 에러를 가로채고 규격화된 에러 코드로 변환하여 프론트엔드와 소통합니다.

### 5. 글로벌 타임존 처리 및 SSR 환경 최적화

* **로컬 타임존 동적 렌더링:** 서버(HBS)에서는 DB의 날짜 데이터를 순수 UTC 문자열(ISO 8601)로 HTML 속성에 심어두고, 클라이언트(브라우저 JS)가 접속한 사용자의 로컬 타임존에 맞춰 동적으로 날짜를 변환하여 렌더링하는 글로벌 친화적 아키텍처를 구현했습니다.

### 6. 서버 환경 설정

* **안전한 환경 변수 주입:** `.env` 파일을 도입하여 데이터베이스 연결 정보나 JWT 시크릿 키 등 민감한 정보를 안전하게 분리했습니다. Nest.js의 `ConfigService`를 활용해 애플리케이션 전반에서 타입 안전하게 환경 변수를 주입받습니다.
* **상수(Constants) 모듈화:** 프로젝트 전반에 사용되는 공통 값들을 상수화하고 별도의 폴더로 분리하여 코드의 유지보수성과 가독성을 높였습니다.

### 7. 무중단 CI/CD 자동화 파이프라인 (Docker & GitHub Actions)
* **Docker 기반 인프라 격리:** 애플리케이션(Nest.js), 데이터베이스(MySQL), 캐시(Redis)를 각각의 Docker 컨테이너로 분리 및 `docker-compose`로 묶어 로컬과 운영 서버(운영체제) 간의 환경 불일치 문제를 원천 차단했습니다.
* **GitHub Actions 기반 자동 배포:** `main` 브랜치에 코드가 푸시(Push)되면 즉각적으로 AWS EC2 서버로 소스 코드를 전송하고, 도커 컨테이너를 재빌드(`up --build -d`)하는 무중단 배포 워크플로우(`.yml`)를 구축했습니다.
* **보안 격리:** AWS EC2 보안 그룹(Security Group)을 통해 데이터베이스 직접 접근을 차단하고, 배포에 필요한 마스터키(`.pem`)와 서버 정보는 GitHub Secrets에 안전하게 암호화하여 보관합니다.

## 📌 Core Features

* **카페 비즈니스 로직:** 카페 생성, 복합 유니크 키(`uk_cafe_nickname`)를 활용한 멤버 가입 및 중복 검증, 게시글 작성 및 권한 기반 상세 조회 로직을 완벽하게 구현했습니다.
* **프론트엔드 UI/UX 고도화:** - `FileReader` API를 이용한 이미지 업로드 즉시 썸네일 렌더링 기능
* 정규표현식(Regex)을 활용한 폼 입력 데이터 실시간 검증 (특수문자 차단, 전화번호/생년월일 형식 강제) 및 10자리 영문+숫자 랜덤 식별자 자동 생성 기능
* Flexbox를 활용한 유연하고 반응성 있는 컴포넌트 레이아웃 구성



## 🚀 Getting Started

### Prerequisites

* Node.js (v18 이상 권장)
* MySQL
* Redis
* AWS Account (S3, CloudFront)

### Installation

```bash
# 저장소 클론
$ git clone https://github.com/chomw/nestjs-cafe.git

# 패키지 설치
$ npm install

```

### Environment Variables

프로젝트 루트 폴더에 env폴터를 생성해 주세요. 그런다음 `.env.development`, `.env` 파일을 생성하고 다음 환경 변수를 설정해주세요.
*(참고: 보안상 `.env` 파일은 Github에 업로드되지 않습니다.)*

```env.development
# env.development or env.production 파일
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

# AWS S3 & CloudFront
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_CLOUDFRONT_URL=https://your_cloudfront_domain.net
```

```.env
# .env 파일
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=cafe_db
MYSQL_USER=dbuser
MYSQL_PASSWORD=your_password
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
├── auth/           # 인증/인가 (JWT, RTR 등)
├── cafe/           # 카페 코어 (생성, 가입, 글쓰기, 조회 등)
├── image-upload/   # 미디어 처리 (S3 연동, 리사이징 등)
├── common/         # 전역 필터, 인터셉터, 커스텀 데코레이터
├── redis/          # 레디스 캐시 및 세션
└── user/           # 사용자 정보 관리

```
