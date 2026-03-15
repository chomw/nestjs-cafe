export enum ErrorCode {
    INVALID_INPUT                   = 10001,
    INTERNAL_SERVER_ERROR           = 10002,
    UNAUTHORIZED                    = 10003,
    FORBIDDEN                       = 10004,    
    INVALID_PASSWORD                = 10005,
    TOKEN_EXPIRED                   = 10006,
    INVALID_TOKEN                   = 10007,    

    USER_ALREADY_EXISTS             = 20001,

    CAFE_ALREADY_EXISTS             = 30001,
    CAFE_NOT_FOUND                  = 30002,
    ALREADY_JOINED_MEMBER           = 30003,
    BANNED_MEMBER                   = 30004,
    NOT_CAFE_MEMBER                 = 30005,
    INVALID_MEMBER_STATUS           = 30006,
    NICKNAME_ALREADY_EXISTS         = 30007,

    POST_NOT_FOUND                  = 40001,
}