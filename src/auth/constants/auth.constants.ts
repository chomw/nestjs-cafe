/**
 * JWT 토큰 만료 시간 문자열 (JwtModule, JwtService 발급용)
 * 단위가 명시된 문자열 포맷을 사용하여 단위 혼동을 방지합니다.
 */
export enum AuthTokenExpiresIn {
  ACCESS = '15m', // 15분
  REFRESH = '7d', // 7일
}

/**
 * 토큰 TTL 초(Seconds) 단위 (Redis 세션 저장용)
 * Redis의 EX 옵션은 초 단위를 사용합니다.
 */
export enum AuthTokenTTL {
  ACCESS = 15 * 60,           // 15분
  REFRESH = 7 * 24 * 60 * 60, // 7일
}

/**
 * 토큰 MaxAge 밀리초(Milliseconds) 단위 (Express 브라우저 쿠키용)
 * res.cookie()의 maxAge 옵션은 밀리초 단위를 사용합니다.
 */
export enum AuthTokenMaxAge {
  ACCESS = 15 * 60 * 1000,           // 15분
  REFRESH = 7 * 24 * 60 * 60 * 1000, // 7일
}