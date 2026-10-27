import { findPublic } from "./users.js";
import { ApiError } from "./errors.js";
import jwt from "jsonwebtoken";

const secretHex = process.env.JWT_SECRET;
if (!secretHex) {
  throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.");
}
if(secretHex == "REPLACE_WITH_RANDOM_64_HEX_CHARACTERS"){
  throw new Error("JWT_SECRET은 새로 생성한 key여야 합니다.");
} 
if (!/^[0-9a-fA-F]{64}$/.test(secretHex)) {
  throw new Error("JWT_SECRET은 새로 생성한 64자리 16진수여야 합니다.");
}
const jwtSecret = Buffer.from(secretHex, "hex");

//--------------------------------------------------------------------

// jsonwebtoken은 설치되어 있습니다. 아래 함수의 본문을 구현하세요.
export function issueToken(user) {
  return jwt.sign({}, jwtSecret, {
    algorithm: "HS256",
    subject: user.id.toString(),
    issuer: "webservice-class",
    audience: "board-api",
    expiresIn: Number(process.env.TOKEN_TTL || 90),
  });
}

export function currentUserId(req) {
  // 헤더에서 토큰 추출.
  const authheader = req.headers.authorization;

  // Bearer  접두사를 확인하고, 뒤에 오는 실제 토큰 문자열만 안전하게 추출, Baerer 접두사가 없으면 null 반환.
  const match = /^Bearer (\S+)$/.exec(authheader ?? "");

  if(!match){ // 실제 토큰이 있는지, Bearer 접두사가 있는지 확인. 없으면 401 에러.
    throw new ApiError(401, "TOKEN_REQUIRED", "유효한 토큰이 필요합니다.");
  }

  // token = 추출한 토큰 문자열에서 뒤에 실제 토큰.
  const token = match[1];

  let payload;
  //
  try {
    // 서명검증 -> jwt.verify()를 사용하여 토큰 검증. 유효하지 않으면 예외 발생. iss랑 aud는 검증함.
      payload = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'], 
        issuer: 'webservice-class', // iss 존재 + 값 검증
        audience: 'board-api',  // aud 존재 + 값 검증
      }); // exp 만료 검증
    } catch (error) {
      if(error instanceof jwt.TokenExpiredError){ // 토큰 만료 에러인지 확인.
        throw new ApiError(401, "TOKEN_EXPIRED", "토큰이 만료되었습니다.");
      } // 그 외의 에러는 유효하지 않은 토큰으로 처리.
      throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
    }
    if(  // verify가 안 해 주는 검사: exp 존재 + 형식, sub 존재 + 타입
      typeof payload.exp !== "number" ||  // 만료시간이 없는 토큰을 허용하지 않기 위해
      typeof payload.sub !== "string" ||  // 문자열인지 확인
      !/^[1-9]\d*$/.test(payload.sub)  // 0으로 시작하지 않는 양의 정수 형태의 문자열인지 검사 (형식)
    ){
      throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
    }

    const user = findPublic(Number(payload.sub)); // sub를 숫자로 변환하여 사용자 조회
    if(!user){ // 사용자 존재 여부 확인
      throw new ApiError(401, "INVALID_TOKEN", "사용자를 확인할 수 없습니다.");
    }

    return user.id; // DB에서 확인한 계정의 ID를 반환

}

export function assertOwner(userId, authorId) {
  if(userId !== authorId){
    throw new ApiError(403, "FORBIDDEN", "작성자만 수행할 수 있습니다.");
  }
}
