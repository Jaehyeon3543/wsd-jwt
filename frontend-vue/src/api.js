
let session = { accessToken: "", user: null };
export const getSession = () => session;

export function clearSession() {
  session = { accessToken: "", user: null };
}

function authorizationHeaders() {
  if(!session.accessToken) return {};
  return {Authorization: `Bearer ${session.accessToken}`};
}
  
function friendlyErrorMessage(status, data) {
  if(status === 400) {
    return `잘못된 입력입니다. 확인해주세요.(${data.message})`;
  }
  if(status === 401) {
    if (data.code === "INVALID_CREDENTIALS") {
    return "이메일 또는 비밀번호가 잘못되었습니다.";
  }
  if (data.code === "TOKEN_REQUIRED") {
    return "로그인이 필요합니다.";
  }
  if (data.code === "INVALID_TOKEN") {
    return "로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.";
  }
  if (data.code === "TOKEN_EXPIRED") {
    return "로그인 시간이 만료되었습니다. 다시 로그인해주세요.";
  }
  return "로그인 상태가 아닙니다. 다시 로그인해주세요.";   // 그 외 401
  }
  if(status === 403) {
    return "권한이 없습니다.";
  }
  if(status === 404) {
    return "요청한 게시글을 찾을 수 없습니다.";
  }
  return data.message || data.code || `HTTP ${status}`;
}

export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if(response.status === 401){
      clearSession();
    }
    const error = new Error(friendlyErrorMessage(response.status, data));
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  session = {accessToken: data.accessToken, user: data.user };
  return data.user;
}
export function canEdit(post) {
  if(!session.user) return false;
  return session.user.id === post.authorId;
}
export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) =>
    request("/posts", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) =>
    request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  me: () => request("/me"),
};
