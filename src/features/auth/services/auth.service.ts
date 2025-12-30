import type { User } from "@/shared/types/user";
import { clientRequest } from "@/shared/lib/http/client";

// 로그인
export async function login(loginId: string, password: string) {
  return clientRequest({
    url: "/api/auth/login",
    method: "POST",
    data: { loginId, password },
  });
}

// 로그아웃
export async function logout() {
  return clientRequest({
    url: "/api/auth/logout",
    method: "POST",
  });
}

// 회원가입
export async function signup(inputs: RegisterFormInputs) {
  const { bankCertFile, businessCertFile, ...rest } = inputs;

  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(rest)], { type: "application/json" })
  );
  if (bankCertFile) formData.append("bankCertFile", bankCertFile);
  if (businessCertFile) formData.append("businessCertFile", businessCertFile);

  return clientRequest({
    url: "/api/members/signup",
    method: "POST",
    data: formData,
    // FormData 사용 시 Content-Type은 axios가 자동으로 설정함
  });
}

// 아이디 중복 확인
export async function checkUserId(userId: string) {
  return clientRequest({
    url: "/api/auth/check-userid",
    method: "GET",
    params: { userId },
  });
}

// 관리자 - 대기중인 사용자 목록 조회
export async function getPendingUsers() {
  return clientRequest<User[]>({
    url: "/api/auth/admin/pending-users",
    method: "GET",
  });
}

// 관리자 - 사용자 승인
export async function approveUser(userId: string) {
  return clientRequest({
    url: `/api/auth/admin/approve/${userId}`,
    method: "POST",
  });
}

// 관리자 - 사용자 거부
export async function rejectUser(userId: string, reason: string) {
  return clientRequest({
    url: `/api/auth/admin/reject/${userId}`,
    method: "POST",
    params: { reason },
  });
}
