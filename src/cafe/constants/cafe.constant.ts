/**
 * 카페 멤버 상태 (Status)
 */
export enum CafeMemberStatus {
  ACTIVE = 0,   // 활동중
  PENDING = 1,  // 가입 승인 대기
  LEFT = 2,     // 자진 탈퇴
  BANNED = 3,   // 강제 탈퇴 (차단)
}

/**
 * 카페 멤버 등급 (Level)
 */
export enum CafeMemberLevel {
  MANAGER = 10,     // 매니저
  SUB_MANAGER = 9,  // 부매니저
  REGULAR = 2,      // 정회원
  ASSOCIATE = 1,    // 준회원
  WAITING = 0,      // 가입 대기
}

/**
 * 카페 게시판 페이징 기본값
 */
export const PaginationDefault = {
    PAGE: 1,
    LIMIT: 10,
} as const;

/**
 * 카페 공개 상태
 */
export enum CafePublicType {
  PUBLIC = 0,   // 공개
  PRIVATE = 1,  // 비공개
  APPROVAL = 2, // 초대승인 (가입 승인 필요)
};

/**
 * 캐시 설정 기본값
 */
export const CacheDefault = {
  RECOMMENDED_CAFE_LIMIT: 1000,  // 추천 카페 캐싱 개수
  CACHE_TTL: 3600,               // 캐시 만료 시간
} as const;