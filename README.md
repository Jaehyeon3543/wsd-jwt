# 음악 추천 게시판

웹서비스설계 JWT 게시판 과제입니다. Vue와 Express로 공개 게시판에 JWT 인증과 작성자 권한 검사를 연결했습니다.

## 작성자와 서비스 소개

- 학번 / 이름: **202212215 / 이재현**
- 기술 조합: Vue + Express + SQLite
- GitHub 저장소: <https://github.com/Jaehyeon3543/wsd-jwt>
- 공개 범위 / 브랜치: PUBLIC / `main`
- 코드 구현 기준 커밋: `55a0d93` (최종 제출 기준 커밋 SHA는 문서·증거 반영 후 LMS에 제출)

좋아하는 음악을 추천하고 다른 사람의 추천에서 새로운 음악을 찾고 싶은 사용자를 위한 게시판입니다. 누구나 로그인 없이 추천 글 목록과 상세 내용을 읽을 수 있습니다. 로그인한 사용자는 곡과 추천 이유를 제목·내용으로 작성할 수 있습니다. 글의 수정과 삭제는 작성자 본인에게만 허용합니다.

주요 기능은 로그인과 JWT 발급, 내 정보 조회, 공개 게시글 조회, 인증된 사용자의 글 작성, 본인 글 수정·삭제, 로그아웃과 인증 오류 안내입니다.

## 보고서와 테스트 증거

- [구현 보고서 PDF](docs/report.pdf)
- [테스트 증거 폴더](docs/evidence/): 현재 저장된 화면·터미널 캡처 40장. T01~T17 수동 테스트·추가 확인과 T00 자동 검사·새 clone 재현 증거를 포함하며, 파일명은 `T번호_순번_설명.png` 형식입니다.

## 프로젝트 구조

```text
.
├── README.md                      # 서비스 소개와 설치·실행 안내
├── .gitignore
├── backend-express/
│   ├── .env.example                # 비밀 키를 포함하지 않는 설정 예시
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js                 # 라우트, 입력 검사, HTTP 응답과 오류 처리
│       ├── auth.js                # JWT 발급·검증과 작성자 권한 검사
│       ├── users.js               # Alice·Bob 계정, scrypt 비밀번호 확인
│       ├── store.js               # SQLite 게시글 CRUD와 파일 저장
│       └── errors.js              # 상태·오류 코드를 전달하는 ApiError
├── frontend-vue/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js             # 개발·preview의 /api 프록시
│   └── src/
│       ├── App.vue                # 게시판 화면, 폼, 로그인 표시
│       ├── api.js                 # HTTP 요청, 메모리 세션, Bearer 헤더
│       ├── main.js
│       └── style.css
├── tools/check_api.py              # 제공된 API 자동 검사 도구
└── docs/
    ├── report.pdf                 # 구현 보고서 (제출본)
    └── evidence/                  # 수동 테스트·자동 검사 증거
```

DB 파일은 실행 시 `backend-express/data/board.sqlite`에 생성됩니다. 실제 `.env`, DB, `node_modules/`, 프론트 빌드 결과 `dist/`는 Git에서 제외합니다.

## 실행 환경

아래 환경에서 개발·수동 테스트·로컬 재현을 수행했습니다. 의존성 설치에는 각 폴더의 lock 파일을 사용하는 `npm ci`를 사용합니다.

| 항목 | 확인한 버전 또는 구성 |
|---|---|
| 운영체제 | Windows + WSL2 Ubuntu 26.04.1 LTS |
| 브라우저 | Chrome 155 |
| 프론트·백엔드 런타임 | Node.js 24.21.0, npm 11.19.0 |
| 프론트 | Vue 3.5.43, Vite 8.3.4, @vitejs/plugin-vue 6.0.9 |
| 백엔드 | Express 5.3.0, jsonwebtoken 9.0.3, dotenv 18.0.7 |
| 데이터 저장 | SQLite 파일 DB, sql.js 1.14.2 |
| 자동 검사 실행 환경 | Python 3.14.4, 추가 패키지 없음 |

프로젝트는 Node.js 20.19 이상을 요구합니다. 포함된 Vite와 Vue 플러그인의 Node.js 지원 범위는 `^20.19.0 || >=22.12.0`이며, 위 표의 Node.js 24.21.0에서 작업했습니다. Python은 API 검사 도구를 실행할 때 사용합니다.

## 설치와 실행

아래 명령은 **macOS 터미널(zsh)** 기준입니다. 저는 WSL2 Ubuntu에서 개발·테스트했으며, 아래 명령은 macOS에서도 같은 형태로 동작하는 표준 명령(`git`, `npm`, `cp`, `node`)만 사용합니다. 터미널 창 두 개를 열어 터미널 A에서 백엔드를, 터미널 B에서 프론트를 실행합니다. 외부 DB 서버나 클라우드 배포 없이 로컬에서 동작합니다.

### 0 준비 (최초 1회)

터미널에서 아래 명령으로 버전을 확인합니다.

```sh
node -v     # v20.19 이상 또는 v22.12 이상
npm -v
git --version
python3 --version   # 자동 검사 도구를 실행할 때만 필요
```

### 1 저장소 복제

```sh
git clone https://github.com/Jaehyeon3543/wsd-jwt.git
cd wsd-jwt
```

### 2 백엔드 준비와 실행 — 터미널 A

복제한 저장소 루트에서 실행합니다.

```sh
cd backend-express
npm ci
cp .env.example .env
```

최초 설정 시 `.env`의 예시 키를 새 난수로 직접 교체합니다.

① 새 키 생성. 아래 명령은 64자리 16진수(32바이트) 난수를 한 줄 출력합니다. 출력된 값을 복사합니다.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

② `.env`에 붙여넣기. 텍스트 편집기로 `.env`를 엽니다.

```sh
open -e .env      # macOS 텍스트 편집기로 열기 (터미널 편집기를 쓰려면 nano .env)
```

`JWT_SECRET=` 뒤의 예시 문자열 `REPLACE_WITH_RANDOM_64_HEX_CHARACTERS`를 지우고, ①에서 복사한 값을 붙여넣은 뒤 저장합니다. 등호 앞뒤와 값 끝에 공백이나 따옴표를 넣지 않습니다.

```text
JWT_SECRET=<①에서 생성한 64자리 값>
```

생성한 키는 서버 비밀 키이므로 다른 곳에 공유하거나 커밋하지 않습니다. `.env`는 `.gitignore`로 Git에서 제외되어 있습니다.

③ 서버 실행.

```sh
npm start
```

터미널에 `게시판 시작 코드 http://127.0.0.1:8000/`이 출력되면 정상 실행된 것입니다. 키를 바꾸지 않고 `npm start`를 실행하면 `Error: JWT_SECRET은 새로 생성한 key여야 합니다.`를 출력하고 시작을 거부합니다.

`.env` 생성과 키 설정은 최초 준비 단계입니다. 일반 재실행 때는 같은 백엔드 폴더에서 `npm start`만 실행합니다. 기존 `.env`를 예시 파일로 다시 덮어쓰지 않습니다.

| 설정 | 기본값과 실제 동작 |
|---|---|
| `JWT_SECRET` | 직접 생성한 64자리 hex. 시작 시 형식을 검사하고 32바이트 Buffer로 변환 |
| `TOKEN_TTL` | `90`, 토큰 유효 시간(초). 만료 검사에서는 `3` 사용 |
| `DB_FILE` | `data/board.sqlite`. 백엔드를 실행한 현재 폴더를 기준으로 해석 |
| `PORT` | `8000`. 백엔드는 `127.0.0.1`에서 요청 수신 |
| `JWT_ISSUER`, `JWT_AUDIENCE` | 예시 파일에는 있지만 현재 코드는 읽지 않음. `auth.js`에서 각각 `webservice-class`, `board-api`로 고정 |

dotenv가 백엔드 폴더의 `.env`를 읽습니다. 이미 셸에 설정된 환경변수는 `.env`보다 우선합니다. 키가 없거나, 제공 예시 키이거나, 64자리 hex가 아니면 서버 시작을 중단합니다.

백엔드 실행 후 브라우저에서 <http://127.0.0.1:8000/api/health>를 엽니다. 정상 응답은 HTTP `200`과 다음 JSON입니다.

```json
{"status":"ok","stack":"express"}
```

개발자 도구 Network 또는 `curl -i http://127.0.0.1:8000/api/health`로 실제 HTTP 상태도 확인할 수 있습니다. 백엔드 터미널은 켜 둡니다.

### 3 프론트 빌드와 로컬 실행 — 터미널 B

백엔드 터미널은 그대로 두고, 새 터미널 창 또는 탭(`⌘T`)에서 저장소 루트로 이동한 뒤 실행합니다.

```sh
cd frontend-vue
npm ci
npm run build
npm run preview
```

- 최종 빌드 화면: <http://127.0.0.1:4173>
- 개발 중에는 `npm run dev` 실행 후 <http://127.0.0.1:5173> 사용
- API 주소: <http://127.0.0.1:8000>

브라우저의 `/api` 요청을 Vite의 `preview.proxy`가 8000번 백엔드로 전달합니다. 개발 서버는 `server.proxy`를 사용합니다. 두 프로세스가 모두 실행 중이어야 하며, `dist/index.html`을 직접 여는 대신 preview 주소로 접속합니다.

백엔드 포트를 바꾸면 `.env`의 `PORT`와 `frontend-vue/vite.config.js`의 `server.proxy`, `preview.proxy`를 함께 수정하고 서버를 재시작합니다. 프론트는 5173·4173번 포트가 사용 중이면 자동으로 다른 포트를 선택하지 않습니다.

종료할 때는 각 터미널에서 `Control+C`(`⌃C`)를 누릅니다. macOS에서도 `⌘C`가 아니라 `Control` 키입니다. 이전 서버를 끄지 않고 다시 실행하면 백엔드는 `EADDRINUSE`, 프론트는 `Port 4173 is already in use` 오류가 나므로, 먼저 실행 중인 터미널에서 종료합니다. 프론트 코드를 고친 뒤 빌드 화면에서 보려면 `npm run build` 후 `npm run preview`를 다시 실행합니다. 백엔드 코드나 `.env`를 변경하면 백엔드를 종료하고 `npm start`로 재시작합니다.

### 4 테스트 계정과 DB

| 사용자 | ID | 이메일 | 실습용 비밀번호 |
|---|---:|---|---|
| Alice | 1 | alice@class.test | Classroom!2026 |
| Bob | 2 | bob@class.test | Classroom!2026 |

위 계정은 과제 전용 테스트 계정입니다. 실제 서비스 계정 정보나 서버 비밀 키를 기록하지 않습니다.

두 계정은 서버 시작 시 `users.js`에서 준비하며, 입력 비밀번호를 scrypt 해시와 비교합니다. 회원가입 없이 위 계정으로 테스트합니다. 사용자 응답에는 `id`, `name`, `email`만 포함합니다.

게시글은 SQLite에 저장합니다. 기본 경로는 `backend-express/data/board.sqlite`이며, 폴더·DB·`posts` 테이블은 없으면 자동 생성됩니다. 새 DB에는 게시글이 없습니다. sql.js의 메모리 DB 내용을 등록·수정·삭제 시 파일로 저장하므로 같은 백엔드 폴더와 DB 경로로 재시작하면 글이 유지됩니다. 한 DB 파일에는 백엔드 프로세스 하나를 사용합니다.

초기화하려면 백엔드를 종료하고, `backend-express` 폴더에서 `rm data/board.sqlite`로 DB 파일을 삭제한 뒤 `npm start`로 다시 실행합니다. `DB_FILE`을 바꾸었다면 실제 지정한 파일을 대상으로 합니다. 초기화하면 기존 게시글은 삭제됩니다. 실제 서버 종료·재시작 후 제목·내용·작성자 유지를 확인했습니다(T15). 증거는 [글 생성](docs/evidence/T15_01_create.png), [서버 종료](docs/evidence/T15_02_server_stop.png), [재시작 명령](docs/evidence/T15_04_server_restart.png), [재조회](docs/evidence/T15_03_after_restart.png)에 있습니다.

## 구현 완료 범위

아래 기능을 구현했으며, T01~T17 수동 테스트는 모두 직접 수행해 PASS를 확인했습니다. 자동 검사와 수동 검사의 수행 범위는 다음 절에 구분해 기록했습니다.

| 기능 | 구현 상태 | 주요 파일과 함수 |
|---|---|---|
| 공개 목록·상세 조회 | 완료 | `app.js` GET 라우트, `store.js` `list`·`get` |
| 로그인과 JWT 발급 | 완료 | `users.js` `verifyCredentials`, `auth.js` `issueToken`, `api.js` `login` |
| JWT 검증과 내 정보 조회 | 완료 | `auth.js` `currentUserId`, `app.js` GET /api/me |
| 글 작성과 작성자 저장 | 완료 | POST /api/posts, `store.create` |
| 본인 글 수정·삭제 | 완료 | `auth.js` `assertOwner`, PUT·DELETE 라우트, `api.js` `canEdit` |
| 만료·로그아웃 처리 | 완료 | `api.js` `request`·`clearSession`, `App.vue` `run`·`logout` |
| 입력·권한·글 없음 안내 | 완료 | `app.js` `fields`·오류 처리기, `api.js` `friendlyErrorMessage`, `App.vue` 404 분기 |
| SQLite 파일 저장 | 완료, 제공 기능 유지 | `store.js` `flush` |

제목·내용은 공백 정리 후 각각 1~100자·1~5000자로 서버에서 검사합니다. 등록·수정에는 `title`, `content` 두 필드만 허용합니다. `authorId`, `userId`, `id` 등 추가 필드는 거부하고, 작성자는 검증된 사용자 ID로 결정합니다.

동작상 제한은 다음과 같습니다.

- 토큰은 과제 지침에 따라 `api.js`의 메모리 변수에만 보관합니다. 새로고침하면 토큰이 남지 않아 로그인 상태는 해제되며, 저장된 게시글은 유지됩니다.
- 로그아웃은 현재 탭의 토큰과 사용자 상태를 지웁니다. 이미 복사한 토큰은 서버에서 즉시 폐기하지 않으며 만료까지 유효할 수 있습니다.
- 만료 사실은 보호 API 요청에 대한 `401` 응답을 받은 시점에 화면에 반영합니다.
- 회원가입, Refresh Token, 관리자 기능, 이미지 업로드는 구현 범위에 포함하지 않습니다.
- 새 clone 검증 당시 `npm ci`에서 `1 high severity vulnerability` 의존성 보안 경고가 표시되었습니다. 제공된 `package-lock.json`을 유지했으며 별도 조치는 하지 않았습니다([설치 로그](docs/evidence/T00_02_clone_refuse.png)).

현재 기능 테스트에서 확인된 미완성 기능이나 미해결 버그는 없습니다. 위 의존성 보안 경고는 별도 미조치 항목입니다.

## 테스트 방법과 결과 요약

### 자동 API 검사

백엔드를 기본 TTL로 실행해 둔 상태에서 저장소 루트의 별도 터미널에서 실행합니다.

```sh
python3 tools/check_api.py --mode final
```

위 명령을 실행해 40개 검사 전체 통과를 확인했습니다. [자동 final 검사 결과](docs/evidence/T00_01_check_final.png)에 실행 명령과 `All 40 checks passed (final)`이 보입니다.

만료 자동 검사 옵션 `--expiry`는 실행하지 않았습니다. 만료는 T10에서 TTL을 3초로 설정하고 실제 만료 후 `/me`와 PUT 수정 요청을 보내 수동 검증했습니다. `/me`는 응답 JSON의 `TOKEN_EXPIRED`를 확인했고, PUT은 HTTP 401과 `TOKEN_EXPIRED` 전용 화면 문구로 확인했습니다. 두 경우 모두 화면이 로그아웃 상태로 전환되었습니다.

T10 수동 만료 테스트를 재현하려면 백엔드를 종료한 뒤, `backend-express` 폴더에서 다음과 같이 재시작합니다.

```sh
TOKEN_TTL=3 npm start
```

두 요청은 각각 새로 로그인한 뒤 따로 검사합니다.

1. 로그인하고 3초보다 충분히 기다린 뒤 내 정보 조회를 요청합니다. 만료 응답과 화면의 로그인 해제를 확인합니다.
2. 다시 로그인해 새 토큰을 발급받고 본인 글의 수정 폼을 엽니다. 3초보다 충분히 기다린 뒤 수정 저장을 요청해 만료 응답과 화면의 로그인 해제를 확인합니다.

첫 번째 요청의 401 응답은 메모리 토큰을 지웁니다. 재로그인 없이 두 번째 요청을 보내면 토큰 누락 검사로 바뀌므로, 두 요청 사이에 반드시 다시 로그인합니다.

위 명령처럼 `npm start` 앞에 `TOKEN_TTL=3`을 붙이면 그 실행에만 TTL이 적용됩니다. 검사가 끝나면 `Control+C`로 종료하고 일반 `npm start`로 다시 실행하면 `.env`의 기본값(90초)으로 돌아갑니다.

검사 도구는 임시 글을 생성하고 정상 완료 시 삭제합니다. 실패하면 출력된 글 ID를 확인해 남은 시험 글을 정리합니다. 자동 검사는 화면·로그아웃·새로고침·실제 서버 재시작 검사를 대신하지 않습니다.

### 수동 테스트 결과

T01~T17 총 17개 시나리오를 모두 직접 수행했으며, 모두 PASS입니다. 모든 화면 증거는 `npm run build` → `npm run preview`로 실행한 <http://127.0.0.1:4173> 빌드본에서 촬영했습니다. `/api` 요청은 8000번 백엔드로 프록시했습니다. API 직접 요청은 curl로 확인했습니다.

| 항목 | 확인 결과 | 증거 |
|---|---|---|
| 공개 조회·정상 로그인·내 정보 | 200, 공개 사용자 정보, 비로그인 읽기 허용 | T01·T02·T05 |
| 글 작성 | 201, `Location: /api/posts/{id}`, 작성자 ID | T05 |
| 본인 글 수정·삭제 | 200·204, 삭제 본문 없음, 수정 시 작성자·생성 시각 유지 | T06·T17 |
| 잘못된 계정 | 401 / INVALID_CREDENTIALS | T03·T00_01(JSON code) |
| 토큰 없음 | 401 / TOKEN_REQUIRED | T04·T11·T17·T14_04 |
| 서명 변조 | 401 / INVALID_TOKEN, 변경 요청 후 원문 유지 | T09 |
| 정상 서명의 만료 토큰 | 401 / TOKEN_EXPIRED, 화면 로그인 해제 | T10 |
| 다른 작성자의 수정·삭제 | 403 / FORBIDDEN, 원문 유지 | T07·T08 |
| 추가 작성자 필드·입력 오류 | 400 / BAD_INPUT, DB 변경 없음 | T12·T13 |
| 없는 글·잘못된 ID | 404 / NOT_FOUND, ID 형식 오류는 400 / BAD_INPUT | T14 |
| 서버 재시작·페이지 새로고침 | 글 유지, 새로고침 시 로그인 해제 | T15·T16 |

보호 API 401의 `WWW-Authenticate: Bearer`, 등록 201의 `Location`, 삭제 204의 빈 본문을 확인했습니다. 화면 알림과 함께 Network 또는 curl에서 실제 HTTP 상태·JSON code·응답 헤더를 확인했습니다. 타인 글 변경은 직접 API 요청으로 검사하고, 실패 후 공개 조회로 내용이 그대로임을 확인했습니다.

T07·T08의 403은 curl로 확인했습니다. 브라우저에서 403 응답을 받은 뒤 로그인 상태가 유지되는지는 별도로 테스트하지 않았습니다. 아래 핵심 구현 설명의 403 상태 유지는 코드 동작에 대한 설명입니다.

수정 요청은 인증 → ID 형식 → 글 존재 → 작성자 권한 → 입력 검사 → 변경 순서로 처리합니다. 삭제 요청은 인증 → ID 형식 → 글 존재 → 작성자 권한 → 삭제 순서이며 본문 입력 검사는 없습니다. JSON 자체가 깨진 요청은 앞선 JSON 파싱 단계에서 400으로 거부될 수 있습니다.

정상 JSON과 정상 ID 형식에서 토큰 없이 없는 글을 수정하면 401, 정상 토큰으로 같은 글을 수정하면 404입니다. Bob이 Alice 글에 잘못된 입력을 보내면 403이며, Alice 본인이 같은 입력을 보내면 400입니다.

오류 조건이 겹치는 경우에 대한 추가 확인도 완료했습니다.

- [T07 추가 증거](docs/evidence/T07_02_bob_bad_input.png): 같은 글에 빈 제목으로 수정을 요청했을 때 Bob은 `403 FORBIDDEN`, 작성자 Alice는 `400 BAD_INPUT`이었습니다. 권한 검사가 입력 검사보다 먼저 수행됨을 확인했습니다.
- [T14 추가 증거](docs/evidence/T14_04_no_token_missing.png): 토큰 없이 없는 글 `999999`를 수정하면 `401 TOKEN_REQUIRED`였습니다. 정상 토큰으로 없는 글을 수정한 T14의 `404 NOT_FOUND`와 구분해 인증이 글 존재 확인보다 먼저임을 확인했습니다.

### 새 폴더에서 실행 재현

공개 저장소를 새 폴더에 clone하여 다음 절차를 직접 수행했고 모두 성공했습니다.

1. 백엔드에서 `npm ci` → `cp .env.example .env` 후 예시 키 그대로 `npm start`하면 시작을 거부하는지 확인했습니다.
2. 새 키를 설정하고 `npm start`로 백엔드가 정상 실행되는 것을 확인했습니다.
3. 프론트에서 `npm ci` → `npm run build` → `npm run preview`를 실행하고 4173번 화면에서 게시글 목록 0개와 API 연결을 확인했습니다. 새 clone 환경에서 빈 목록으로 시작한 증거이며, 이 화면이 DB 파일 생성 자체를 직접 보여 주는 것은 아닙니다.
4. clone 환경에서 테스트 계정 로그인도 직접 확인했으나 해당 화면 캡처는 첨부하지 않았습니다.

재현 증거는 [clone·의존성 설치·예시 키 거부](docs/evidence/T00_02_clone_refuse.png), [새 키 설정 후 백엔드 실행](docs/evidence/T00_03_clone_backend.png), [프론트 설치·빌드·preview 실행](docs/evidence/T00_04_clone_build.png), [4173번 접속 화면](docs/evidence/T00_05_clone_screen.png)에 있습니다. 백엔드와 프론트 실행 캡처에는 8000·4173번 포트 충돌 후 재실행하여 정상 실행된 기록도 포함되어 있습니다.

전체 결과와 테스트별 요청·실제 상태·판정은 [구현 보고서](docs/report.pdf)의 4장, 캡처 원본은 [증거 폴더](docs/evidence/)를 참조합니다.

## 핵심 구현 설명

1. 로그인과 발급: `App.vue` → `api.js` `login()` → POST /api/auth/login 순서로 이메일·비밀번호를 보냅니다. 서버는 입력·계정을 확인한 뒤 `issueToken()`으로 HS256 JWT를 발급합니다. 문자열 사용자 ID `sub`, 만료 `exp`, 발급자 `iss`, 사용 대상 `aud`가 포함됩니다. 응답은 `accessToken`, `expiresIn`, 공개 정보 `user`입니다.
2. 보관과 전송: 토큰과 사용자는 `api.js`의 `session` 변수에 저장합니다. `request()`가 토큰이 있을 때 `Authorization: Bearer <TOKEN>`을 첨부합니다. 현재 공통 함수는 로그인 상태에서 공개 조회·로그인 요청에도 헤더를 붙일 수 있지만, 공개 API는 토큰 없이 사용할 수 있습니다.
3. 서버 검증: `currentUserId()`는 Bearer 형식을 확인하고 `jwt.verify()`에 HS256·발급자·사용 대상을 지정합니다. 서명·만료 검증 후 `exp`의 존재·숫자 형식, `sub`의 문자열·양의 정수 형식, 실제 계정 존재를 확인해 사용자 ID를 반환합니다. 만료는 `TOKEN_EXPIRED`, 그 밖의 유효하지 않은 토큰은 `INVALID_TOKEN`으로 구분합니다.
4. 작성자 권한과 화면: PUT·DELETE 라우트는 저장된 글을 조회한 뒤 `assertOwner()`로 사용자와 작성자를 비교합니다. 다르면 403으로 변경을 막습니다. `canEdit()`는 화면 버튼을 제어합니다. 프론트는 401이면 세션을 지우고, 403이면 로그인 상태를 유지합니다. 404이면 상세·편집 상태를 비우고 목록을 갱신하며, 204 응답은 JSON 파싱을 하지 않습니다.

## AI 활용 요약과 참고 자료

AI 사용 여부: 사용. 개념 설명, 코드 리뷰·디버깅, 일부 코드 생성, 테스트 지원과 문서 초안 작성 및 리뷰에 활용했습니다.

| 도구 | 사용 목적과 반영 위치 |
|---|---|
| Claude Code (Claude Opus 5.5) | JWT·인증·권한·Vue ref 학습, 제가 작성한 코드 리뷰, 일부 코드 직접 수정, 테스트 명령·스크립트 작성과 증거 검토, 보고서 초안 작성 및 리뷰, README 리뷰 |
| OpenAI Codex (모델 버전 미확인) | 과제 요구사항·프로젝트 구조·요청 흐름 설명, JWT 키 검사·32바이트 변환 예시 코드 제공, README 초안 작성 및 리뷰, 보고서 리뷰 |

저는 `auth.js`의 JWT 발급·검증·작성자 권한 검사, `api.js`의 로그인·토큰 전송·오류 처리, `App.vue`의 화면과 404 처리를 직접 작성·수정했습니다. 키 검사·32바이트 변환의 최종 코드는 제가 작성·수정했으며, 학습 과정에서 Codex가 제공한 예시를 참고했습니다. AI 리뷰에서 발견한 `findPulic` 오타, catch 문법, 401 처리 위치 등의 오류를 직접 수정하고 재검증했습니다.

Claude가 직접 수정한 코드는 `app.js`의 추가 필드 검사(`in` → `Object.hasOwn`)와 body-parser 클라이언트 오류의 400 처리, `style.css`의 비활성 버튼 커서입니다. `.env.example` 복원도 Claude의 도움을 받았습니다. 토큰 21종 검증 스크립트와 T07~T17 curl 명령 작성, 스크린샷 검토에도 활용했으며, 토큰 검증 스크립트는 저장소에 포함하지 않았습니다. 보고서와 README는 AI가 초안 작성 및 리뷰를 지원하고 제가 내용을 확인해 수정했습니다.

상세 사례 3건과 검증 내역은 [구현 보고서](docs/report.pdf)의 5장을 참조합니다.

제가 직접 참고한 자료는 수업 자료와 제공 시작 코드입니다.

- 배포된 과제 공지·API 명세·구현 체크리스트·보고서 및 README 양식·로컬 실행 안내: 요구사항 해석, 구현·검증과 문서 구성에 활용. 시작 자료 `docs/01~07`은 배포된 과제 자료이므로 제출 저장소에서는 제외했습니다.
- 제공 코드 `backend-express/`, `frontend-vue/`, `tools/check_api.py`: 게시판 기본 구조, SQLite 저장, 테스트 계정·비밀번호 검증, API 자동 검사에 활용.

다음 세 자료는 AI 설명의 근거 자료 (직접 열람하지 않음)로 구분합니다.

| 자료 | 관련 설명 |
|---|---|
| [node-jsonwebtoken README](https://github.com/auth0/node-jsonwebtoken) | JWT 발급·검증 옵션, 알고리즘·만료 처리 |
| [RFC 7519: JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519) | `sub`, `exp`, `iss`, `aud` 등 JWT 클레임 |
| [MDN Object.hasOwn()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) | 상속된 키와 객체 자체 속성의 구분, 추가 필드 검사 수정 |

