import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index
} from 'typeorm';

@Entity({ name: 'cafe' })       // 테이블 이름을 'cafe'로 명시 
@Index('idx_name', ['name'])    // name 컬럼에 인덱스 설정
export class Cafe {
    /**
     * PK: INT UNSIGNED AUTO_INCREMENT
     */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'PK' })
    id: number;

    /**
     * 카페 이름: VARCHAR(50), NOT NULL
     */
    @Column({ type: 'varchar', length: 50, comment: '카페이름' })
    name: string;

    /**
     * 카페 URL 주소: VARCHAR(50), UNIQUE
     */
    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
        comment: '카페 URL 주소'
    })
    address: string;

    /**
     * 아이콘 이미지: VARCHAR(100), NULL 허용
     */
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '아이콘 이미지 경로'
    })
    icon_img: string | null;

    /**
     * 공개 유형: TINYINT UNSIGNED, 기본값 0
     */
    @Column({
        type: 'tinyint',
        unsigned: true, 
        default: 0,
        comment: '0:공개, 1:비공개, 2:초대승인'
    })
    public_type: number;

    /**
     * 카페 설명: VARCHAR(100), NULL 허용
     */
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '카페 설명'
    })
    description: string | null;

    /**
     * 생성 일시: DATETIME DEFAULT CURRENT_TIMESTAMP
     * @CreateDateColumn 데코레이터가 자동으로 처리해줌
     */
    @CreateDateColumn({ type: 'datetime', comment: '생성 일시' })
    reg_date: Date;

    /**
     * 최근 활동 일시: DATETIME, NULL 허용
     */
    @Column({
        type: 'datetime',
        nullable: true,
        comment: '최근 활동 일시'
    })
    last_login_date: Date | null;

    /**
     * 멤버 수: INT UNSIGNED, 기본값 1
     */
    @Column({
        type: 'int',
        unsigned: true, 
        default: 1,
        comment: '멤버 수'
    })
    member_count: number;
}



/*
CREATE TABLE `cafe` (
  `id`              INT UNSIGNED 	NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `name`            VARCHAR(50)     NOT NULL                COMMENT '카페 이름',
  `address`         VARCHAR(50)     NOT NULL                COMMENT '카페 URL 주소',
  `icon_img`        VARCHAR(100)    NULL                    COMMENT '아이콘 이미지 경로',
  `public_type`     TINYINT UNSIGNED NOT NULL DEFAULT 0     COMMENT '0:공개, 1:비공개, 2:초대승인',
  `description`     VARCHAR(100)    NULL                    COMMENT '카페 설명',
  `reg_date`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
  `last_login_date` DATETIME        NULL                    COMMENT '최근 활동 일시',
  `member_count`    INT UNSIGNED    NOT NULL DEFAULT 1      COMMENT '멤버 수',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_address` (`address`),		-- 주소(URL)는 중복되면 안 되므로 유니크 키 설정
  INDEX `idx_name` (`name`)					-- 이름으로 검색을 자주 하므로 인덱스 설정
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='카페 정보 테이블';
*/
/*

#### 1) `@Entity({ name: 'cafe' })`

- 역할: 이 클래스가 데이터베이스의 테이블과 매핑됨을 알립니다.
- 옵션: `name` 속성을 주지 않으면 클래스 이름(`Cafe`)을 따라가지만, DB 테이블 명명 규칙(소문자, 스네이크 케이스 등)을 지키기 위해 명시적으로 적어주는 것이 좋습니다.

#### 2) `@PrimaryGeneratedColumn()`

- 역할: 테이블의 기본 키(PK)를 설정합니다.
- 기능: `AUTO_INCREMENT` 속성이 자동으로 포함되어 있어, 데이터가 생성될 때마다 숫자가 1씩 자동으로 증가합니다.

#### 3) `@Column({ options... })`

- 역할: 일반 컬럼을 정의합니다. 가장 많이 쓰이는 데코레이터입니다.
- 주요 옵션:
- `type`: DB 컬럼 타입 (`varchar`, `int`, `tinyint`, `datetime` 등).
- `length`: 문자열의 길이 제한 (`VARCHAR(50)`의 50).
- `nullable`: `true`로 설정하면 DB에 `NULL`이 들어갈 수 있습니다. (설정 안 하면 `NOT NULL`이 기본값)
- `unique`: `true`면 중복된 값을 넣을 수 없습니다. (유니크 키 자동 생성)
- `default`: 값이 입력되지 않았을 때 들어갈 기본값을 설정합니다.
- `unsigned`: 숫자 타입에서 음수를 허용하지 않을 때 사용합니다.
- `comment`: DB 스키마에 주석을 달아줍니다. (팀 협업 시 매우 유용)



#### 4) `@CreateDateColumn()`

- 역할: 데이터가 처음 생성(INSERT)되는 시점의 시간을 자동으로 기록합니다.
- 장점: 굳이 코드에서 `new Date()`를 넣지 않아도, DB에 저장될 때 알아서 현재 시간이 들어갑니다. (`DEFAULT CURRENT_TIMESTAMP`와 동일)

#### 5) `@Index('인덱스명', ['컬럼명'])`

- 역할: 검색 속도를 높이기 위해 인덱스를 설정합니다.
- 위치: 클래스 위에 붙여서 테이블 전체 레벨에서 정의할 수도 있고, 컬럼 위에 `@Index()`만 붙여서 정의할 수도 있습니다.
- 설명: 위 코드에서는 `name` 컬럼으로 검색을 자주 한다고 하셔서 `idx_name`이라는 이름으로 인덱스를 생성했습니다.

#### 6) TypeScript 타입 (`number`, `string`, `Date`)

- DB 타입과 매핑되는 TypeScript 타입을 지정해야 합니다.
- `INT`, `TINYINT` ➔ `number`
- `VARCHAR`, `TEXT` ➔ `string`
- `DATETIME`, `TIMESTAMP` ➔ `Date`


- `nullable: true`인 컬럼은 `string | null` 처럼 유니온 타입을 써주는 것이 타입 안정성에 좋습니다.

*/