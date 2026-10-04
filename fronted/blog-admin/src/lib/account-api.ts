import apiClient from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import type { ApiResponse } from "@/types/common";

/** 首页技术栈微徽标项 */
export interface TechBadgeItem {
  src: string;
  title: string;
  rotate?: number;
}

/** 当前账号个人中心资料 */
export interface CurrentUser extends AuthUser {
  email?: string;
  bio?: string;
  rewardCodeUrl?: string;
  techStack?: TechBadgeItem[];
  socialLinks?: Record<string, any>;
  status: "ACTIVE" | "DISABLED";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 当前账号基础资料更新入参 */
export interface CurrentUserUpdatePayload {
  nickname: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  rewardCodeUrl?: string;
  socialLinks?: Record<string, any>;
}

/** 当前账号密码修改入参 */
export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * 拉取当前登录账号资料
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await apiClient.get<ApiResponse<CurrentUser>>("/auth/me");
  return res.data.data;
}

/**
 * 更新当前登录账号基础资料
 */
export async function updateCurrentUserProfile(payload: CurrentUserUpdatePayload): Promise<CurrentUser> {
  const res = await apiClient.put<ApiResponse<CurrentUser>>("/auth/me/profile", payload);
  return res.data.data;
}

/**
 * 修改当前登录账号密码
 */
export async function changeCurrentUserPassword(payload: PasswordChangePayload): Promise<void> {
  await apiClient.put<ApiResponse<void>>("/auth/me/password", payload);
}

/**
 * 初始化双重验证 (2FA)
 */
export async function initTwoFactor(): Promise<{ secret: string; otpauthUri: string }> {
  const res = await apiClient.get<ApiResponse<{ secret: string; otpauthUri: string }>>("/auth/me/2fa/init");
  return res.data.data;
}

/**
 * 启用双重验证 (2FA)
 */
export async function enableTwoFactor(payload: { secret: string; code: string }): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/auth/me/2fa/enable", payload);
}

/**
 * 停用双重验证 (2FA)
 */
export async function disableTwoFactor(payload: { code: string }): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/auth/me/2fa/disable", payload);
}

/**
 * 绑定 GitHub 账号
 */
export async function bindGithub(payload: { githubId: string; githubUsername: string }): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/auth/me/github/bind", payload);
}

/**
 * 解绑 GitHub 账号
 */
export async function unbindGithub(): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/auth/me/github/unbind");
}
