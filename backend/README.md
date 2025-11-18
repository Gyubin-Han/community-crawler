# Korean Community Aggregator - Backend

Spring Boot 기반 REST API 서버

## 기술 스택

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- MariaDB
- Maven
- Lombok

## 시작하기

### 1. MariaDB 설정

MariaDB 서버에 데이터베이스를 생성하세요:

```sql
CREATE DATABASE community_aggregator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 데이터베이스 설정 수정

`src/main/resources/application.yml` 파일에서 데이터베이스 연결 정보를 수정하세요:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/community_aggregator
    username: your_username
    password: your_password
```

### 3. 프로젝트 빌드

```bash
cd backend
mvn clean install
```

### 4. 애플리케이션 실행

```bash
mvn spring-boot:run
```

또는 JAR 파일로 실행:

```bash
java -jar target/aggregator-1.0.0.jar
```

서버는 `http://localhost:8080`에서 실행됩니다.

## API 엔드포인트

### 게시글 조회

- **모든 게시글 조회**
  ```
  GET /api/posts
  ```

- **커뮤니티별 조회**
  ```
  GET /api/posts?community=ruliweb
  ```

- **게시판별 조회**
  ```
  GET /api/posts?board=유머 게시판
  ```

- **검색**
  ```
  GET /api/posts?search=검색어
  ```

- **특정 게시글 조회**
  ```
  GET /api/posts/{id}
  ```

### 게시글 생성/수정/삭제

- **게시글 생성**
  ```
  POST /api/posts
  Content-Type: application/json

  {
    "id": "unique-id",
    "title": "제목",
    "author": "작성자",
    "community": "ruliweb",
    "board": "유머 게시판",
    "content": "내용",
    "views": 0,
    "comments": 0,
    "likes": 0,
    "timestamp": "2025-11-18T10:00:00",
    "url": "https://..."
  }
  ```

- **일괄 생성**
  ```
  POST /api/posts/batch
  Content-Type: application/json

  [
    {...},
    {...}
  ]
  ```

- **게시글 업데이트**
  ```
  PUT /api/posts/{id}
  ```

- **게시글 삭제**
  ```
  DELETE /api/posts/{id}
  ```

### 헬스 체크

```
GET /api/posts/health
```

## 데이터베이스 스키마

### posts 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(255) | Primary Key |
| title | VARCHAR(500) | 게시글 제목 |
| author | VARCHAR(100) | 작성자 |
| community | VARCHAR(50) | 커뮤니티 (dcinside, ruliweb, arcalive) |
| board | VARCHAR(100) | 게시판 이름 |
| content | TEXT | 게시글 내용 |
| views | INTEGER | 조회수 |
| comments | INTEGER | 댓글 수 |
| likes | INTEGER | 추천 수 |
| timestamp | DATETIME | 게시글 작성 시간 |
| url | VARCHAR(1000) | 원본 URL |
| created_at | DATETIME | 생성 시간 |
| updated_at | DATETIME | 수정 시간 |

인덱스:
- `idx_community` on `community`
- `idx_board` on `board`
- `idx_timestamp` on `timestamp`

## 개발 모드

개발 시 `application.yml`의 설정:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # 자동으로 테이블 생성/수정
    show-sql: true      # SQL 로그 출력
```

## 프로덕션 배포

프로덕션 환경에서는 `application-prod.yml`을 생성하고:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # 테이블 스키마 검증만
    show-sql: false       # SQL 로그 비활성화

logging:
  level:
    com.community.aggregator: INFO
```

실행:
```bash
java -jar target/aggregator-1.0.0.jar --spring.profiles.active=prod
```
