import { ErrorCode } from './error-code.constant';

// Record<키, 값> 타입을 사용하여 ErrorCode에 정의된 모든 키가 반드시 포함되도록 강제합니다.
export const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_INPUT]               : '잘못된 입력값입니다.',
  [ErrorCode.INTERNAL_SERVER_ERROR]       : '서버 내부 오류가 발생했습니다.',
  [ErrorCode.UNAUTHORIZED]                : '인증이 필요합니다.',
  [ErrorCode.FORBIDDEN]                   : '접근 권한이 없습니다.',
  [ErrorCode.INVALID_PASSWORD]            : '비밀번호가 일치하지 않습니다.',
  [ErrorCode.TOKEN_EXPIRED]               : '만료된 토큰입니다.',
  [ErrorCode.INVALID_TOKEN]               : '유효하지 않은 토큰입니다.',

  [ErrorCode.USER_ALREADY_EXISTS]         : '이미 사용중인 유저 아이디입니다.',

  [ErrorCode.CAFE_ALREADY_EXISTS]         : '이미 사용중인 카페 주소입니다',
  [ErrorCode.CAFE_NOT_FOUND]              : '카페를 찾을 수 없습니다.',
  [ErrorCode.ALREADY_JOINED_MEMBER]       : '이미 가입되었거나 대기 중인 상태입니다.',
  [ErrorCode.BANNED_MEMBER]               : '해당 카페에서 강제 탈퇴되었습니다.',    
  [ErrorCode.NOT_CAFE_MEMBER]             : '카페에 가입한 멤버만 글을 작성할 수 있습니다.',
  [ErrorCode.INVALID_MEMBER_STATUS]       : '현재 글을 작성할 수 있는 상태가 아닙니다.',

  [ErrorCode.POST_NOT_FOUND]              : '존재하지 않거나 삭제된 게시글입니다.',
};