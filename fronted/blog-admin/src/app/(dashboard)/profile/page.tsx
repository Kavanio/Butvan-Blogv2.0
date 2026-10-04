"use client";

import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  GitBranch,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Smartphone,
  User,
  QrCode,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn, Button } from "@heroui/react";
import QRCode from "qrcode";
import apiClient from "@/lib/api";
import { setUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import {
  changeCurrentUserPassword,
  fetchCurrentUser,
  updateCurrentUserProfile,
  initTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  bindGithub,
  unbindGithub,
  type CurrentUser,
  type TechBadgeItem,
} from "@/lib/account-api";

type ProfileTab = "profile" | "security" | "bindings";

export const DEFAULT_TECH_STACK: TechBadgeItem[] = [
  { src: "/images/tech/spring.svg", title: "Java & Spring Boot 3", rotate: -6 },
  { src: "/images/tech/postgres.svg", title: "PostgreSQL & JPA", rotate: -4 },
  { src: "/images/tech/nextjs.svg", title: "Next.js & React 19", rotate: 6 },
  { src: "/images/tech/docker.svg", title: "Docker & Linux", rotate: -5 },
  { src: "/images/tech/agent.svg", title: "AI Agent & LLM", rotate: -6 },
];

interface ProfileFormState {
  nickname: string;
  email: string;
  avatarUrl: string;
  bio: string;
  rewardCodeUrl: string;
  techStack: TechBadgeItem[];
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DEFAULT_PROFILE_FORM: ProfileFormState = {
  nickname: "",
  email: "",
  avatarUrl: "",
  bio: "",
  rewardCodeUrl: "",
  techStack: DEFAULT_TECH_STACK,
};

const DEFAULT_PASSWORD_FORM: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * 解析头像地址，兼容后端本地上传相对路径
 */
function resolveAvatarUrl(avatarUrl?: string): string {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const host = apiBase.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
}

/**
 * 格式化后端时间字符串为中文日期
 */
function formatDate(value?: string): string {
  if (!value) return "暂无记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "暂无记录";
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 计算注册天数，至少展示 1 天
 */
function getRegistrationDays(value?: string): number {
  if (!value) return 1;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 1;
  const diff = Date.now() - date.getTime();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

/**
 * 由当前账号资料生成表单初始状态
 */
function toProfileForm(user: CurrentUser): ProfileFormState {
  const rawTech = Array.isArray(user.socialLinks?.techStack)
    ? (user.socialLinks?.techStack as TechBadgeItem[])
    : Array.isArray(user.techStack)
    ? user.techStack
    : null;

  return {
    nickname: user.nickname || "",
    email: user.email || "",
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    rewardCodeUrl: user.rewardCodeUrl || (user.socialLinks?.rewardCodeUrl as string) || "",
    techStack: rawTech && rawTech.length > 0 ? rawTech : DEFAULT_TECH_STACK,
  };
}

/**
 * 个人中心设置页面
 */
export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rewardFileInputRef = useRef<HTMLInputElement>(null);
  const badgeFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [initialForm, setInitialForm] = useState<ProfileFormState>(DEFAULT_PROFILE_FORM);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(DEFAULT_PROFILE_FORM);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(DEFAULT_PASSWORD_FORM);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingRewardCode, setUploadingRewardCode] = useState(false);
  const [uploadingBadgeIndex, setUploadingBadgeIndex] = useState<number | null>(null);

  // 模拟 GitHub 绑定弹窗状态
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [ghUsernameInput, setGhUsernameInput] = useState("");
  const [bindingGh, setBindingGh] = useState(false);

  // 2FA 弹窗状态
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<"enable" | "disable">("enable");
  const [twoFactorSecretData, setTwoFactorSecretData] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [totpCodeInput, setTotpCodeInput] = useState("");
  const [submittingTotp, setSubmittingTotp] = useState(false);

  const reloadUserData = async () => {
    const user = await fetchCurrentUser();
    const nextForm = toProfileForm(user);
    setCurrentUser(user);
    setInitialForm(nextForm);
    setProfileForm(nextForm);
    setUser(user);
  };

  useEffect(() => {
    /**
     * 初始化个人中心数据
     */
    const loadCurrentUser = async () => {
      try {
        await reloadUserData();
      } catch (error) {
        console.error("获取当前账号资料失败", error);
        toast.error("获取个人中心资料失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const isProfileDirty = useMemo(() => {
    return (
      profileForm.nickname !== initialForm.nickname ||
      profileForm.email !== initialForm.email ||
      profileForm.avatarUrl !== initialForm.avatarUrl ||
      profileForm.bio !== initialForm.bio ||
      profileForm.rewardCodeUrl !== initialForm.rewardCodeUrl ||
      JSON.stringify(profileForm.techStack) !== JSON.stringify(initialForm.techStack)
    );
  }, [initialForm, profileForm]);

  const avatarUrl = resolveAvatarUrl(profileForm.avatarUrl);
  const registrationDays = getRegistrationDays(currentUser?.createdAt);

  /**
   * 更新个人资料表单字段
   */
  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 更新某个技术栈徽标的属性
   */
  const handleUpdateBadge = (index: number, patch: Partial<TechBadgeItem>) => {
    setProfileForm((prev) => {
      const nextStack = [...prev.techStack];
      nextStack[index] = { ...nextStack[index], ...patch };
      return { ...prev, techStack: nextStack };
    });
  };

  /**
   * 上移徽标
   */
  const handleMoveBadgeUp = (index: number) => {
    if (index <= 0) return;
    setProfileForm((prev) => {
      const nextStack = [...prev.techStack];
      const temp = nextStack[index - 1];
      nextStack[index - 1] = nextStack[index];
      nextStack[index] = temp;
      return { ...prev, techStack: nextStack };
    });
  };

  /**
   * 下移徽标
   */
  const handleMoveBadgeDown = (index: number) => {
    setProfileForm((prev) => {
      if (index >= prev.techStack.length - 1) return prev;
      const nextStack = [...prev.techStack];
      const temp = nextStack[index + 1];
      nextStack[index + 1] = nextStack[index];
      nextStack[index] = temp;
      return { ...prev, techStack: nextStack };
    });
  };

  /**
   * 删除某个徽标
   */
  const handleDeleteBadge = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }));
  };

  /**
   * 新增空白徽标
   */
  const handleAddBadge = () => {
    const defaultAngles = [-6, -4, 6, -5, -6, 4, -3];
    const nextRotate = defaultAngles[profileForm.techStack.length % defaultAngles.length];
    setProfileForm((prev) => ({
      ...prev,
      techStack: [
        ...prev.techStack,
        { src: "", title: "", rotate: nextRotate },
      ],
    }));
  };

  /**
   * 恢复预设徽标
   */
  const handleResetDefaultTechStack = () => {
    if (confirm("确认恢复为系统预设的技术栈徽标列表吗？未保存的自定义修改将被覆盖。")) {
      setProfileForm((prev) => ({
        ...prev,
        techStack: DEFAULT_TECH_STACK,
      }));
      toast.success("已恢复预设技术栈徽标，请点击“保存资料”以生效");
    }
  };

  /**
   * 触发为指定索引的徽标上传图标
   */
  const handleTriggerUploadBadgeIcon = (index: number) => {
    setUploadingBadgeIndex(index);
    badgeFileInputRef.current?.click();
  };

  /**
   * 处理徽标图片文件上传
   */
  const handleBadgeIconFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const targetIndex = uploadingBadgeIndex;
    if (!file || targetIndex === null) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式的图标文件（支持 SVG、PNG、WebP 等）");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "TECH_STACK");
      formData.append("sourceDetail", `技术栈徽标-${profileForm.techStack[targetIndex]?.title || "Icon"}`);
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) {
        toast.error(res.data?.msg || "图标上传失败");
        return;
      }
      handleUpdateBadge(targetIndex, { src: fileUrl });
      toast.success("图标已成功上传并回填");
    } catch (error) {
      console.error("上传徽标图标失败", error);
      toast.error("图标上传失败，请确认媒体服务是否可用");
    } finally {
      setUploadingBadgeIndex(null);
      event.target.value = "";
    }
  };

  /**
   * 选择本地头像图片
   */
  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  /**
   * 上传头像并回填头像地址
   */
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式的头像文件");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "USER_AVATAR");
      formData.append("sourceDetail", "用户头像");
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) {
        toast.error(res.data?.msg || "头像上传失败");
        return;
      }
      updateProfileField("avatarUrl", fileUrl);
      toast.success("头像已上传，请保存资料后生效");
    } catch (error) {
      console.error("头像上传失败", error);
      toast.error("头像上传失败，请确认媒体服务是否可用");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  /**
   * 上传赞赏/收款码图片
   */
  const handleRewardCodeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式的赞赏码文件");
      return;
    }

    setUploadingRewardCode(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "REWARD_CODE");
      formData.append("sourceDetail", "赞赏收款二维码");
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) {
        toast.error(res.data?.msg || "赞赏码上传失败");
        return;
      }
      updateProfileField("rewardCodeUrl", fileUrl);
      toast.success("赞赏收款码已上传，请保存资料后生效");
    } catch (error) {
      console.error("赞赏码上传失败", error);
      toast.error("赞赏码上传失败，请确认媒体服务是否可用");
    } finally {
      setUploadingRewardCode(false);
      event.target.value = "";
    }
  };

  /**
   * 保存个人资料
   */
  const handleSaveProfile = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!profileForm.nickname.trim()) {
      toast.warning("昵称不能为空");
      return;
    }

    setSavingProfile(true);
    try {
      const updatedUser = await updateCurrentUserProfile({
        nickname: profileForm.nickname.trim(),
        email: profileForm.email.trim() || undefined,
        avatarUrl: profileForm.avatarUrl.trim() || undefined,
        bio: profileForm.bio.trim() || undefined,
        rewardCodeUrl: profileForm.rewardCodeUrl.trim() || undefined,
        socialLinks: {
          ...(currentUser?.socialLinks || {}),
          techStack: profileForm.techStack,
        },
      });
      const nextForm = toProfileForm(updatedUser);
      setCurrentUser(updatedUser);
      setInitialForm(nextForm);
      setProfileForm(nextForm);
      setUser(updatedUser);
      toast.success("个人中心资料已保存");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { msg?: string } } };
      toast.error(apiError.response?.data?.msg || "保存资料失败，请稍后重试");
    } finally {
      setSavingProfile(false);
    }
  };

  /**
   * 修改当前账号登录密码
   */
  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning("两次输入的新密码不一致");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.warning("新密码至少需要 6 个字符");
      return;
    }

    setChangingPassword(true);
    try {
      await changeCurrentUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(DEFAULT_PASSWORD_FORM);
      toast.success("密码已更新，请妥善保管新密码");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { msg?: string } } };
      toast.error(apiError.response?.data?.msg || "密码修改失败，请检查当前密码");
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * 解绑 GitHub 账号
   */
  const handleUnbindGithub = async () => {
    if (!confirm("确认解除与 GitHub 账号的绑定吗？")) return;
    try {
      await unbindGithub();
      toast.success("GitHub 解绑成功");
      await reloadUserData();
    } catch (error) {
      console.error("解绑 GitHub 失败", error);
      toast.error("解绑 GitHub 失败，请稍后重试");
    }
  };

  /**
   * 开始绑定 GitHub （开启弹窗）
   */
  const handleStartBindGithub = () => {
    setGhUsernameInput("");
    setShowGithubModal(true);
  };

  /**
   * 确认绑定 GitHub （模拟授权）
   */
  const handleConfirmBindGithub = async (e: FormEvent) => {
    e.preventDefault();
    if (!ghUsernameInput.trim()) {
      toast.warning("请输入 GitHub 用户名");
      return;
    }
    setBindingGh(true);
    try {
      const githubId = "gh-" + Math.floor(Math.random() * 8999999 + 1000000);
      await bindGithub({
        githubId,
        githubUsername: ghUsernameInput.trim(),
      });
      toast.success(`成功绑定 GitHub 账号：@${ghUsernameInput}`);
      setShowGithubModal(false);
      await reloadUserData();
    } catch (error) {
      console.error("绑定 GitHub 失败", error);
      toast.error("绑定 GitHub 失败，请稍后重试");
    } finally {
      setBindingGh(false);
    }
  };

  const handleStartEnableTwoFactor = async () => {
    setTotpCodeInput("");
    setSubmittingTotp(true);
    try {
      const data = await initTwoFactor();
      setTwoFactorSecretData(data);
      
      // 本地生成二维码的 Base64 编码
      const qrDataUrl = await QRCode.toDataURL(data.otpauthUri, {
        width: 180,
        margin: 1,
      });
      setQrCodeDataUrl(qrDataUrl);

      setTwoFactorStep("enable");
      setShowTwoFactorModal(true);
    } catch (error) {
      console.error("初始化 2FA 失败", error);
      toast.error("初始化双重校验失败，请稍后重试");
    } finally {
      setSubmittingTotp(false);
    }
  };

  /**
   * 开始关闭 2FA
   */
  const handleStartDisableTwoFactor = () => {
    setTotpCodeInput("");
    setTwoFactorStep("disable");
    setShowTwoFactorModal(true);
  };

  /**
   * 确认启用或停用 2FA
   */
  const handleConfirmTwoFactor = async (e: FormEvent) => {
    e.preventDefault();
    if (totpCodeInput.length !== 6) {
      toast.warning("请输入 6 位数字验证码");
      return;
    }

    setSubmittingTotp(true);
    try {
      if (twoFactorStep === "enable") {
        if (!twoFactorSecretData) return;
        await enableTwoFactor({
          secret: twoFactorSecretData.secret,
          code: totpCodeInput,
        });
        toast.success("成功启用双重验证！下次登录时需校验验证码。");
      } else {
        await disableTwoFactor({
          code: totpCodeInput,
        });
        toast.success("双重验证已关闭");
      }
      setShowTwoFactorModal(false);
      setTwoFactorSecretData(null);
      await reloadUserData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { msg?: string } } };
      toast.error(apiError.response?.data?.msg || "校验失败，请确保验证码正确且未过期");
    } finally {
      setSubmittingTotp(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 p-1 text-left text-zinc-800 dark:text-zinc-200">
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <User size={17} className="text-primary" />
          <h1 className="font-heading text-base font-bold text-zinc-950 dark:text-zinc-50">个人中心</h1>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
            {currentUser?.status === "ACTIVE" ? "账号正常" : "已停用"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <CalendarDays size={14} />
          <span>已加入 {registrationDays} 天</span>
          <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span>最近登录：{formatDate(currentUser?.lastLoginAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-2 border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="账号头像" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-2xl font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {profileForm.nickname?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase() || "A"}
                </div>
              )}
              <Button
                isIconOnly
                onPress={handleChooseAvatar}
                isDisabled={uploadingAvatar}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90"
                aria-label="上传头像"
              >
                {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="min-w-0 text-center">
              <p className="truncate text-base font-bold text-zinc-950 dark:text-zinc-50">{profileForm.nickname || "管理员"}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">@{currentUser?.username}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{currentUser?.role}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                UID {currentUser?.id}
              </span>
            </div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <MetaRow label="注册日期" value={formatDate(currentUser?.createdAt)} />
            <MetaRow label="资料更新" value={formatDate(currentUser?.updatedAt)} />
            <MetaRow label="绑定邮箱" value={profileForm.email || "未绑定"} />
          </div>
        </aside>

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex border-b border-zinc-200 px-4 dark:border-zinc-800">
            <TabButton active={activeTab === "profile"} icon={<User size={14} />} label="个人资料" onClick={() => setActiveTab("profile")} />
            <TabButton active={activeTab === "security"} icon={<ShieldCheck size={14} />} label="安全设置" onClick={() => setActiveTab("security")} />
            <TabButton active={activeTab === "bindings"} icon={<BadgeCheck size={14} />} label="账号绑定" onClick={() => setActiveTab("bindings")} />
          </div>

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="昵称" required>
                  <input
                    type="text"
                    value={profileForm.nickname}
                    onChange={(event) => updateProfileField("nickname", event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="请输入昵称"
                  />
                </Field>
                <Field label="头像地址">
                  <input
                    type="text"
                    value={profileForm.avatarUrl}
                    onChange={(event) => updateProfileField("avatarUrl", event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="https:// 或 /uploads/..."
                  />
                </Field>
              </div>
              <Field label="个人简介">
                <textarea
                  value={profileForm.bio}
                  onChange={(event) => updateProfileField("bio", event.target.value)}
                  className="min-h-24 resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="写一段会展示在账号资料中的简介"
                  maxLength={500}
                />
              </Field>

              {/* 赞赏/收款二维码设置 */}
              <Field label="赞赏收款码（前台文章赞赏弹窗展示）">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950">
                    {profileForm.rewardCodeUrl ? (
                      <img
                        src={resolveAvatarUrl(profileForm.rewardCodeUrl)}
                        alt="赞赏收款码"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-zinc-400 text-xs select-none">
                        <QrCode size={22} className="text-zinc-400" />
                        <span className="text-[10px]">未设置</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1 w-full min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        ref={rewardFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleRewardCodeChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="tertiary"
                        onClick={() => rewardFileInputRef.current?.click()}
                        isDisabled={uploadingRewardCode}
                        className="h-8 gap-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {uploadingRewardCode ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        上传赞赏码图片
                      </Button>
                      {profileForm.rewardCodeUrl && (
                        <Button
                          type="button"
                          size="sm"
                          variant="danger-soft"
                          onClick={() => updateProfileField("rewardCodeUrl", "")}
                          className="h-8 px-2 text-xs"
                        >
                          清除图片
                        </Button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={profileForm.rewardCodeUrl}
                      onChange={(event) => updateProfileField("rewardCodeUrl", event.target.value)}
                      className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                      placeholder="或直接输入赞赏码图片 URL 地址 (https://...)"
                    />
                    <p className="text-[11px] text-zinc-400">
                      上传你的微信/支付宝赞赏收款二维码，读者点击前台文章“赞赏”按钮时将直接展示该图片。
                    </p>
                  </div>
                </div>
              </Field>

              {/* 隐藏的徽标文件上传 input */}
              <input
                ref={badgeFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBadgeIconFileChange}
                className="hidden"
              />

              {/* 首页技术栈微徽标配置 */}
              <Field label="首页技术栈徽标（扑克牌展开式徽标）">
                <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                  {/* 顶栏说明与操作栏 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Layers size={14} className="text-primary" />
                        动态徽标列表 ({profileForm.techStack.length} 个)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        对应前台名片区的层叠徽标组。鼠标悬停时扇形展开并提示标题，可调整图标、标题及角度。
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant="tertiary"
                        onClick={handleAddBadge}
                        className="h-7 gap-1 rounded-md px-2.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Plus size={13} />
                        添加徽标
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleResetDefaultTechStack}
                        className="h-7 gap-1 rounded-md px-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        aria-label="恢复系统预设技术栈徽标"
                      >
                        <RotateCcw size={12} />
                        恢复预设
                      </Button>
                    </div>
                  </div>

                  {/* 实时扑克牌层叠展开预览 */}
                  {profileForm.techStack.length > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 px-3.5 py-2">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>前台效果实时预览：</span>
                        <span className="text-[11px] text-zinc-400">（鼠标悬停展开看气泡）</span>
                      </div>

                      <div className="relative z-10 inline-flex items-center translate-y-[2px]">
                        {profileForm.techStack.map((item, idx) => {
                          const rotateDeg =
                            typeof item.rotate === "number" && !Number.isNaN(item.rotate)
                              ? item.rotate
                              : [-6, -4, 6, -5, -6, 4, -3][idx % 7];
                          const iconUrl = resolveAvatarUrl(item.src);
                          return (
                            <span
                              key={idx}
                              style={{
                                marginLeft: idx === 0 ? "0" : "-10px",
                                transform: `rotate(${rotateDeg}deg)`,
                              }}
                              className="group/adminchip relative inline-block transition-transform duration-200 hover:scale-125 hover:z-30 cursor-pointer"
                            >
                              {/* 悬停气泡 */}
                              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/adminchip:opacity-100 z-50">
                                {item.title || "未命名"}
                              </span>
                              <span className="block size-6 rounded-[5px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-xs overflow-hidden">
                                {iconUrl ? (
                                  <img
                                    src={iconUrl}
                                    alt={item.title}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400">
                                    ?
                                  </div>
                                )}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 徽标条目列表 */}
                  {profileForm.techStack.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-zinc-400 gap-2">
                      <p>当前未配置任何技术栈徽标，前台将回退至系统预设徽标。</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleResetDefaultTechStack}
                        className="h-7 text-xs bg-primary text-white"
                      >
                        一键加载默认徽标
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {profileForm.techStack.map((badge, index) => {
                        const badgeIcon = resolveAvatarUrl(badge.src);
                        const isUploading = uploadingBadgeIndex === index;

                        return (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 transition-shadow hover:shadow-xs"
                          >
                            {/* 图标预览与点击上传 */}
                            <div className="flex items-center gap-2">
                              <span className="w-5 text-center font-mono text-[11px] font-semibold text-zinc-400">
                                #{index + 1}
                              </span>
                              <div
                                onClick={() => handleTriggerUploadBadgeIcon(index)}
                                title="点击上传或更换图标"
                                className="group relative flex size-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 transition-colors hover:border-primary"
                              >
                                {isUploading ? (
                                  <Loader2 size={14} className="animate-spin text-primary" />
                                ) : badgeIcon ? (
                                  <img
                                    src={badgeIcon}
                                    alt={badge.title}
                                    className="h-6 w-6 object-contain"
                                  />
                                ) : (
                                  <Upload size={14} className="text-zinc-400 group-hover:text-primary" />
                                )}
                              </div>
                            </div>

                            {/* 标题输入框 */}
                            <div className="flex-[1.2] min-w-0">
                              <input
                                type="text"
                                value={badge.title}
                                onChange={(e) => handleUpdateBadge(index, { title: e.target.value })}
                                placeholder="展示标题 (如 Docker & Linux)"
                                className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 font-medium"
                              />
                            </div>

                            {/* 图标地址输入框及快捷上传按钮 */}
                            <div className="flex-[2] min-w-0 flex items-center gap-1">
                              <input
                                type="text"
                                value={badge.src}
                                onChange={(e) => handleUpdateBadge(index, { src: e.target.value })}
                                placeholder="图标 URL 或 /images/tech/..."
                                className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 font-mono text-[11px]"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="tertiary"
                                onClick={() => handleTriggerUploadBadgeIcon(index)}
                                isDisabled={isUploading}
                                className="h-8 shrink-0 px-2 text-[11px] text-primary bg-primary/10 hover:bg-primary/20"
                                aria-label="上传本地图片"
                              >
                                {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                上传
                              </Button>
                            </div>

                            {/* 旋转角度微调 */}
                            <div className="w-20 shrink-0 flex items-center gap-1">
                              <input
                                type="number"
                                min={-45}
                                max={45}
                                value={badge.rotate ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? undefined : Number(e.target.value);
                                  handleUpdateBadge(index, { rotate: val });
                                }}
                                placeholder="角度"
                                className="h-8 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 font-mono text-[11px]"
                                title="层叠旋转角度（单位：度）"
                              />
                              <span className="text-[11px] text-zinc-400 select-none">°</span>
                            </div>

                            {/* 操作栏：上移、下移、删除 */}
                            <div className="flex items-center gap-0.5 justify-end sm:justify-start">
                              <button
                                type="button"
                                onClick={() => handleMoveBadgeUp(index)}
                                disabled={index === 0}
                                className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                title="上移"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveBadgeDown(index)}
                                disabled={index === profileForm.techStack.length - 1}
                                className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                title="下移"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBadge(index)}
                                className="flex h-7 w-7 items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                                title="删除此徽标"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Field>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <span className={cn("text-xs", isProfileDirty ? "text-amber-600 dark:text-amber-300" : "text-zinc-400")}>
                  {isProfileDirty ? "资料有未保存修改" : "当前资料已同步"}
                </span>
                <Button
                  type="submit"
                  isDisabled={!isProfileDirty || savingProfile}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-white"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  保存资料
                </Button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="flex max-w-[560px] flex-col gap-4 p-5">
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>修改密码后当前 Token 仍可继续使用；重新登录时请使用新密码。</span>
              </div>
              <Field label="当前密码" required>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="请输入当前密码"
                />
              </Field>
              <Field label="新密码" required>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="至少 6 个字符"
                />
              </Field>
              <Field label="确认新密码" required>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="再次输入新密码"
                />
              </Field>
              <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <Button
                  type="submit"
                  isDisabled={changingPassword}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  更新密码
                </Button>
              </div>
            </form>
          )}

          {activeTab === "bindings" && (
            <div className="flex flex-col gap-5 p-5">
              {/* 绑定状态卡片组 */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <BindingItem
                  icon={<Mail size={15} />}
                  title="电子邮箱"
                  value={profileForm.email || "未绑定"}
                  active={!!profileForm.email}
                />
                <BindingItem
                  icon={<GitBranch size={15} />}
                  title="GitHub"
                  value={currentUser?.githubUsername ? `@${currentUser.githubUsername}` : "暂未绑定"}
                  active={!!currentUser?.githubUsername}
                />
                <BindingItem
                  icon={<ShieldCheck size={15} />}
                  title="双重验证 (2FA)"
                  value={currentUser?.twoFactorEnabled ? "已开启安全保护" : "未开启"}
                  active={!!currentUser?.twoFactorEnabled}
                />
              </div>

              {/* 邮箱管理区块 */}
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="mb-2 text-xs font-bold text-zinc-950 dark:text-zinc-50">邮箱绑定管理</h3>
                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                  <Field label="修改或绑定邮箱">
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) => updateProfileField("email", event.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                      placeholder="name@example.com"
                    />
                  </Field>
                  <div className="flex items-end gap-2">
                    {profileForm.email && (
                      <Button
                        type="button"
                        variant="outline"
                        onPress={() => {
                          if (confirm("确定要解除邮箱绑定吗？")) {
                            updateProfileField("email", "");
                            setTimeout(() => handleSaveProfile(), 0);
                          }
                        }}
                        className="h-10 w-full text-xs font-bold md:w-auto"
                      >
                        解绑
                      </Button>
                    )}
                    <Button
                      type="submit"
                      isDisabled={!isProfileDirty || savingProfile}
                      className="h-10 w-full items-center gap-2 bg-primary px-4 text-xs font-bold text-white md:w-auto"
                    >
                      {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {initialForm.email ? "保存修改" : "立即绑定"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* GitHub 与 2FA 绑定管理区块 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* GitHub 绑定 */}
                <div className="flex flex-col justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">GitHub 账号绑定</h3>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                      绑定后可用于社交化链接展示及后续可能的第三方快速登录。
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-900">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {currentUser?.githubUsername ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          已绑定: @{currentUser.githubUsername}
                        </span>
                      ) : (
                        "当前未绑定 GitHub 账号"
                      )}
                    </span>
                    {currentUser?.githubUsername ? (
                      <Button
                        onPress={handleUnbindGithub}
                        size="sm"
                        variant="danger"
                        className="rounded px-2.5 py-1.5 text-[11px] font-bold"
                      >
                        解除绑定
                      </Button>
                    ) : (
                      <Button
                        onPress={handleStartBindGithub}
                        size="sm"
                        className="rounded bg-zinc-950 px-2.5 py-1.5 text-[11px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950 animate-pulse"
                      >
                        立即绑定
                      </Button>
                    )}
                  </div>
                </div>

                {/* 2FA 绑定 */}
                <div className="flex flex-col justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">双重身份验证 (2FA)</h3>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                      启用后，登录管理后台系统时需要输入身份验证器 App 生成的 6 位动态验证码。
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-900">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {currentUser?.twoFactorEnabled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">已启用 2FA 保护</span>
                      ) : (
                        "当前未开启双重验证"
                      )}
                    </span>
                    {currentUser?.twoFactorEnabled ? (
                      <Button
                        onPress={handleStartDisableTwoFactor}
                        size="sm"
                        variant="danger"
                        className="rounded px-2.5 py-1.5 text-[11px] font-bold"
                      >
                        停用 2FA
                      </Button>
                    ) : (
                      <Button
                        onPress={handleStartEnableTwoFactor}
                        size="sm"
                        className="rounded bg-primary px-2.5 py-1.5 text-[11px] font-bold text-white animate-pulse"
                      >
                        开启验证
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 模拟 GitHub OAuth 绑定 Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-left">
            <h3 className="font-heading text-sm font-bold text-zinc-950 dark:text-zinc-50">GitHub 账号授权模拟</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
              这里模拟第三方 OAuth 授权确认。请输入您的 GitHub 用户名以完成绑定：
            </p>
            <form onSubmit={handleConfirmBindGithub} className="mt-4 space-y-4">
              <Field label="GitHub 用户名">
                <input
                  type="text"
                  value={ghUsernameInput}
                  onChange={(e) => setGhUsernameInput(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="例如: octocat"
                  required
                  autoFocus
                />
              </Field>
              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => setShowGithubModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  isDisabled={bindingGh}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {bindingGh ? "绑定中..." : "授权并绑定"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA 启用/停用验证 Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-left">
            <h3 className="font-heading text-sm font-bold text-zinc-950 dark:text-zinc-50">
              {twoFactorStep === "enable" ? "启用双重验证 (2FA)" : "停用双重验证 (2FA)"}
            </h3>
            
            <form onSubmit={handleConfirmTwoFactor} className="mt-4 space-y-4">
              {twoFactorStep === "enable" && twoFactorSecretData && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                    请使用身份验证器 App（如 Google Authenticator）扫描下方二维码，或手动输入下方密钥：
                  </p>
                  
                  {/* 二完码图片 */}
                  <div className="flex flex-col items-center justify-center py-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeDataUrl}
                      alt="2FA QR Code"
                      className="h-40 w-40 border border-zinc-200 bg-white p-1 rounded"
                    />
                    <div className="mt-2 select-all font-mono text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                      密钥: {twoFactorSecretData.secret}
                    </div>
                  </div>
                </div>
              )}

              {twoFactorStep === "disable" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                  为了您的账户安全，停用双重校验前需要进行身份验证。请输入您手机中生成的 6 位验证码：
                </p>
              )}

              <Field label="6 位身份验证码">
                <input
                  type="text"
                  value={totpCodeInput}
                  onChange={(e) => setTotpCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 text-center font-mono tracking-widest text-base"
                  placeholder="000000"
                  required
                  maxLength={6}
                  autoFocus
                />
              </Field>

              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => {
                    setShowTwoFactorModal(false);
                    setTwoFactorSecretData(null);
                  }}
                  className="rounded-lg px-4 py-2 text-xs font-bold"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  isDisabled={submittingTotp}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
                >
                  {submittingTotp ? "验证中..." : "确认提交"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

/**
 * 个人中心顶部页签按钮
 */
function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-11 items-center gap-1.5 px-3 text-xs font-bold transition-colors",
        active ? "text-primary" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
      )}
    >
      {icon}
      {label}
      {active && <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary" />}
    </button>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * 表单字段容器组件
 */
function Field({ label, required = false, children }: FieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

interface MetaRowProps {
  label: string;
  value: string;
}

/**
 * 左侧账号元信息行
 */
function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
      <span className="text-zinc-500 dark:text-zinc-500">{label}</span>
      <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  );
}

interface BindingItemProps {
  icon: ReactNode;
  title: string;
  value: string;
  active: boolean;
}

/**
 * 账号绑定状态项
 */
function BindingItem({ icon, title, value, active }: BindingItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-800">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
        <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-500">{value}</span>
      </span>
      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-300" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900")}>
        {active ? "已绑定" : "未绑定"}
      </span>
    </div>
  );
}

/**
 * 个人中心页面骨架屏
 */
function ProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 p-1">
      <div className="h-12 animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800/50" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-96 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50" />
      </div>
    </div>
  );
}
