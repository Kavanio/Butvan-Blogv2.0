"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Upload,
  Save,
  GitFork,
  Mail,
  Rss,
  AlertCircle,
  Loader2,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@heroui/react";

/** 首页技术栈微徽标项 */
export interface TechBadgeItem {
  src: string;
  title: string;
  rotate?: number;
  link?: string;
}

/**
 * 个人资料配置页面 (高密度双栏一体化大厂风格)
 * - 左侧：一体化精细配置表单，全局 Dirty-State 统一保存（支持基本资料、关于我、技术栈徽标、社交网络及页脚站点信息）
 * - 右侧：头像上传与实景博主名片预览二合一挂件，消弭页面过剩留白
 * - 紧密排版，信息饱满，无零散分离卡片
 */
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badgeFileInputRef = useRef<HTMLInputElement>(null);

  // --- 初始加载状态比对对象，感知全局更改 ---
  const [initialData, setInitialData] = useState<{
    nickname: string;
    avatarUrl: string;
    bio: string;
    introLine1: string;
    introLine2: string;
    techStack: TechBadgeItem[];
    github: string;
    email: string;
    rss: string;
    footerTitle: string;
    footerSubtitle: string;
    footerIcp: string;
    footerStartDate: string;
  } | null>(null);

  // --- 各表单字段当前编辑状态 ---
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [introLine1, setIntroLine1] = useState("");
  const [introLine2, setIntroLine2] = useState("");
  const [techStack, setTechStack] = useState<TechBadgeItem[]>([]);
  const [uploadingBadgeIndex, setUploadingBadgeIndex] = useState<number | null>(null);
  const [github, setGithub] = useState("");
  const [email, setEmail] = useState("");
  const [rss, setRss] = useState("");
  const [footerTitle, setFooterTitle] = useState("");
  const [footerSubtitle, setFooterSubtitle] = useState("");
  const [footerIcp, setFooterIcp] = useState("");
  const [footerStartDate, setFooterStartDate] = useState("");

  // --- 加载及保存中状态 ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- 站点全局背景图片状态 ---
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [bgImageSaving, setBgImageSaving] = useState(false);
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  // --- 邮箱验证码配置状态 ---
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [emailInitialSubject, setEmailInitialSubject] = useState("");
  const [emailInitialTemplate, setEmailInitialTemplate] = useState("");

  // --- 解析后端图片相对 URL 路径 ---
  const resolveUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    const host = apiBase.replace(/\/api$/, "");
    return url.startsWith("/") ? `${host}${url}` : url;
  };

  // --- 获取初始博主资料 ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await apiClient.get("/admin/profile");
        if (res.data.code === 200 || res.data.code === 0) {
          const data = res.data.data;
          const links = data.socialLinks || {};
          const loadedTechStack: TechBadgeItem[] = Array.isArray(links.techStack)
            ? links.techStack
            : [];

          const profile = {
            nickname: data.nickname || "",
            avatarUrl: data.avatarUrl || "",
            bio: data.bio || "",
            introLine1: links.introLine1 || "",
            introLine2: links.introLine2 || "",
            techStack: loadedTechStack,
            github: links.github || "",
            email: links.email || "",
            rss: links.rss || "",
            footerTitle: links.footerTitle || "",
            footerSubtitle: links.footerSubtitle || "",
            footerIcp: links.footerIcp || "",
            footerStartDate: links.footerStartDate || "",
          };
          setInitialData(profile);
          setNickname(profile.nickname);
          setAvatarUrl(profile.avatarUrl);
          setBio(profile.bio);
          setIntroLine1(profile.introLine1);
          setIntroLine2(profile.introLine2);
          setTechStack(loadedTechStack);
          setGithub(profile.github);
          setEmail(profile.email);
          setRss(profile.rss);
          setFooterTitle(profile.footerTitle);
          setFooterSubtitle(profile.footerSubtitle);
          setFooterIcp(profile.footerIcp);
          setFooterStartDate(profile.footerStartDate);
        }
      } catch (err) {
        console.error("获取个人资料失败", err);
        toast.error("获取个人公开资料失败，请检查网络或后端接口");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // --- 获取当前站点背景图片配置 ---
  useEffect(() => {
    const fetchBgImage = async () => {
      try {
        const res = await apiClient.get("/admin/site-config/background_image_url");
        if (res.data.code === 200 || res.data.code === 0) {
          setBgImageUrl(res.data.data?.configValue || "");
        }
      } catch (err) {
        console.error("获取站点背景图片配置失败", err);
      }
    };
    fetchBgImage();
  }, []);

  // --- 获取当前站点邮箱发送验证码配置 ---
  useEffect(() => {
    const fetchEmailConfigs = async () => {
      try {
        const resSubject = await apiClient.get("/admin/site-config/email_verify_subject");
        if (resSubject.data.code === 200 || resSubject.data.code === 0) {
          const val = resSubject.data.data?.configValue || "";
          setEmailSubject(val);
          setEmailInitialSubject(val);
        }
        const resTemplate = await apiClient.get("/admin/site-config/email_verify_template");
        if (resTemplate.data.code === 200 || resTemplate.data.code === 0) {
          const val = resTemplate.data.data?.configValue || "";
          setEmailTemplate(val);
          setEmailInitialTemplate(val);
        }
      } catch (err) {
        console.error("获取邮件模板配置失败", err);
      }
    };
    fetchEmailConfigs();
  }, []);

  // --- 头像上传 ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式文件进行上传");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "SYSTEM_CONFIG");
      formData.append("sourceDetail", "系统配置");
      const res = await apiClient.post("/admin/media/upload", formData, {
        timeout: 120000,
      });
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success("头像上传成功，点击下方按钮保存生效");
        setAvatarUrl(res.data.data.fileUrl);
      } else {
        toast.error(res.data.msg || "头像上传失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("上传头像接口异常，请确认后端媒体服务开启");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // --- 站点背景图片上传 ---
  const handleBgImageClick = () => {
    bgFileInputRef.current?.click();
  };

  const handleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.warning("请选择图片格式文件进行上传");
      return;
    }

    setBgImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "SYSTEM_CONFIG");
      formData.append("sourceDetail", "站点全局背景图片");
      const res = await apiClient.post("/admin/media/upload", formData, {
        timeout: 120000,
      });
      if (res.data.code === 200 || res.data.code === 0) {
        const fileUrl = res.data.data.fileUrl;
        setBgImageUrl(fileUrl);
        toast.success("背景图片上传成功，正在保存配置...");
        // 自动保存背景图配置到站点配置表
        await saveBgImageConfig(fileUrl);
      } else {
        toast.error(res.data.msg || "背景图片上传失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("上传背景图片接口异常，请确认后端媒体服务开启");
    } finally {
      setBgImageUploading(false);
      e.target.value = "";
    }
  };

  /** 保存背景图 URL 到站点配置表 */
  const saveBgImageConfig = async (url: string) => {
    setBgImageSaving(true);
    try {
      const res = await apiClient.put("/admin/site-config/background_image_url", {
        configValue: url,
      });
      if (res.data.code === 200 || res.data.code === 0) {
        toast.success("站点全局背景图片已生效");
      } else {
        toast.error(res.data.msg || "保存背景图片配置失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("保存背景图片配置接口异常");
    } finally {
      setBgImageSaving(false);
    }
  };

  /** 清除站点背景图片 */
  const handleClearBgImage = async () => {
    setBgImageSaving(true);
    try {
      const res = await apiClient.put("/admin/site-config/background_image_url", {
        configValue: "",
      });
      if (res.data.code === 200 || res.data.code === 0) {
        setBgImageUrl("");
        toast.success("站点背景图片已清除");
      } else {
        toast.error(res.data.msg || "清除背景图片配置失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("清除背景图片配置接口异常");
    } finally {
      setBgImageSaving(false);
    }
  };

  // --- 技术栈徽标操作方法 ---
  const handleAddBadge = () => {
    const angles = [-6, -4, 6, -5, -6, 4, -3];
    const nextRotate = angles[techStack.length % angles.length];
    setTechStack((prev) => [...prev, { src: "", title: "", rotate: nextRotate, link: "" }]);
  };

  const handleUpdateBadge = (index: number, patch: Partial<TechBadgeItem>) => {
    setTechStack((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleMoveBadgeUp = (index: number) => {
    if (index <= 0) return;
    setTechStack((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveBadgeDown = (index: number) => {
    setTechStack((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleDeleteBadge = (index: number) => {
    setTechStack((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTriggerUploadBadge = (index: number) => {
    setUploadingBadgeIndex(index);
    badgeFileInputRef.current?.click();
  };

  const handleBadgeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      formData.append("sourceDetail", `技术栈徽标-${techStack[targetIndex]?.title || "Icon"}`);
      const res = await apiClient.post("/admin/media/upload", formData, {
        timeout: 60000,
      });
      if (res.data.code === 200 || res.data.code === 0) {
        const fileUrl = res.data.data.fileUrl;
        handleUpdateBadge(targetIndex, { src: fileUrl });
        toast.success("图标已成功上传并回填");
      } else {
        toast.error(res.data.msg || "图标上传失败");
      }
    } catch (err) {
      console.error("上传徽标失败", err);
      toast.error("上传图标接口异常，请确认媒体服务是否可用");
    } finally {
      setUploadingBadgeIndex(null);
      e.target.value = "";
    }
  };

  // --- 全局表单保存提交 ---
  const handleGlobalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.warning("展示昵称不能为空");
      return;
    }

    // 正则简单校正建站起始时间格式
    if (footerStartDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(footerStartDate)) {
      toast.warning("建站起始日期格式错误，必须为 YYYY-MM-DD 形式");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nickname,
        avatarUrl,
        bio,
        socialLinks: {
          introLine1,
          introLine2,
          techStack,
          github,
          email,
          rss,
          footerTitle,
          footerSubtitle,
          footerIcp,
          footerStartDate,
        },
      };

      const res = await apiClient.put("/admin/profile", payload);
      if (res.data.code === 200 || res.data.code === 0) {
        // 保存邮件验证配置
        if (emailSubject !== emailInitialSubject) {
          await apiClient.put("/admin/site-config/email_verify_subject", {
            configValue: emailSubject,
          });
          setEmailInitialSubject(emailSubject);
        }
        if (emailTemplate !== emailInitialTemplate) {
          await apiClient.put("/admin/site-config/email_verify_template", {
            configValue: emailTemplate,
          });
          setEmailInitialTemplate(emailTemplate);
        }

        toast.success("个人公开资料与邮箱配置已保存成功");
        
        // 校准已同步数据缓存
        setInitialData({
          nickname,
          avatarUrl,
          bio,
          introLine1,
          introLine2,
          techStack,
          github,
          email,
          rss,
          footerTitle,
          footerSubtitle,
          footerIcp,
          footerStartDate,
        });
      } else {
        toast.error(res.data.msg || "保存公开资料失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("保存公开资料接口访问异常");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  // --- 检测全页表单是否被修改 (Dirty-state) ---
  const isFormDirty =
    nickname !== (initialData?.nickname ?? "") ||
    avatarUrl !== (initialData?.avatarUrl ?? "") ||
    bio !== (initialData?.bio ?? "") ||
    introLine1 !== (initialData?.introLine1 ?? "") ||
    introLine2 !== (initialData?.introLine2 ?? "") ||
    JSON.stringify(techStack) !== JSON.stringify(initialData?.techStack ?? []) ||
    github !== (initialData?.github ?? "") ||
    email !== (initialData?.email ?? "") ||
    rss !== (initialData?.rss ?? "") ||
    footerTitle !== (initialData?.footerTitle ?? "") ||
    footerSubtitle !== (initialData?.footerSubtitle ?? "") ||
    footerIcp !== (initialData?.footerIcp ?? "") ||
    footerStartDate !== (initialData?.footerStartDate ?? "") ||
    emailSubject !== emailInitialSubject ||
    emailTemplate !== emailInitialTemplate;

  return (
    <div className="max-w-[1200px] mx-auto p-2 md:p-4 flex flex-col gap-5 text-left font-body text-zinc-800 dark:text-zinc-200">
      
      {/* 头部标题区域 */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
        <User className="text-primary w-4.5 h-4.5" />
        <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-heading">
          博主个人公开资料设置
        </h1>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono font-bold">
          CONSOLE
        </span>
      </div>

      {/* 紧凑双栏网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 左侧：一体化紧密配置表单面板 (占 8 列) */}
        <form onSubmit={handleGlobalSave} className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-5 flex flex-col gap-5">
            
            {/* 分区 1：基本展示信息 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  1. 基础形象与展示
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  配置您的公开昵称和一句话签名，这是读者对您的第一印象。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* 昵称 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    博主展示昵称 <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="昵称"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* 签名 (Bio) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    一句话签名 / 职业头衔 (Bio)
                  </span>
                  <input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Java/Kotlin 全栈开发 / 独立设计师"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4" />

            {/* 分区 2：详细自我介绍故事 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  2. 详细关于我文案
                </h3>
                <p className="text-xs text-zinc-555 dark:text-zinc-400">
                  前台「关于我」页面展示的核心短标签以及长句介绍，可用 Emoji 修饰。
                </p>
              </div>
              <div className="flex flex-col gap-3.5 pt-1">
                {/* 第一行 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    核心自我标签 (第一行文案)
                  </span>
                  <input
                    value={introLine1}
                    onChange={(e) => setIntroLine1(e.target.value)}
                    placeholder="例如：🔥 大三前端探索者 | 写代码也写生活 | 开源项目复盘 ✨"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* 第二行 (故事正文) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    博客宗旨与详细故事 (第二行文案)
                  </span>
                  <textarea
                    value={introLine2}
                    onChange={(e) => setIntroLine2(e.target.value)}
                    placeholder="例如：欢迎来我的博客交流学习，一起成长进步，用代码碰撞灵感，一起走更远~"
                    rows={3}
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4" />

            {/* 隐藏的技术徽标文件上传 input */}
            <input
              type="file"
              ref={badgeFileInputRef}
              onChange={handleBadgeFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* 分区 3：首页技术栈徽标配置 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" />
                    3. 首页技术栈微徽标 (扑克牌展开徽标)
                  </h3>
                  <p className="text-xs text-zinc-555 dark:text-zinc-400">
                    紧跟在第一行文案后面的微型徽标组。鼠标悬停时扇形展开并提示标题。支持上传本地图标、自定义跳转链接与微调旋转角度。若未配置跳转链接，点击则不会发生跳转。未配置时前台不显示任何死数据。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBadge}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>添加徽标</span>
                </button>
              </div>

              {/* 空状态 */}
              {techStack.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center">
                  <p className="text-xs text-zinc-400 mb-2">当前未配置任何技术栈徽标（前台将保持纯净，绝不展示任何死数据）</p>
                  <button
                    type="button"
                    onClick={handleAddBadge}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    <Plus size={13} />
                    <span>立即添加第一个技术徽标</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  {/* 实时展开小预览 */}
                  <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 px-3 py-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Sparkles size={12} className="text-amber-500" />
                      <span>实时扑克牌展开预览：</span>
                      <span className="text-[10px] text-zinc-400">（鼠标悬停查看扇形展开与气泡，带 ↗ 表示配置了外链）</span>
                    </div>

                    <div className="relative z-10 inline-flex items-center translate-y-[1px]">
                      {techStack.map((item, idx) => {
                        const rotateDeg =
                          typeof item.rotate === "number" && !Number.isNaN(item.rotate)
                            ? item.rotate
                            : [-6, -4, 6, -5, -6, 4, -3][idx % 7];
                        const iconUrl = resolveUrl(item.src);
                        const hasLink = Boolean(item.link && item.link.trim());
                        return (
                          <span
                            key={idx}
                            style={{
                              marginLeft: idx === 0 ? "0" : "-8px",
                              transform: `rotate(${rotateDeg}deg)`,
                            }}
                            className="group/chip relative inline-block transition-transform duration-200 hover:scale-125 hover:z-30 cursor-pointer"
                          >
                            <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/chip:opacity-100 z-50 flex items-center gap-1">
                              <span>{item.title || "未命名"}</span>
                              {hasLink && <span className="text-[9px] opacity-75">↗</span>}
                            </span>
                            <span className="block size-5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-xs overflow-hidden">
                              {iconUrl ? (
                                <img
                                  src={iconUrl}
                                  alt={item.title}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-400">
                                  ?
                                </div>
                              )}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 徽标条目列表 */}
                  {techStack.map((badge, index) => {
                    const badgeIcon = resolveUrl(badge.src);
                    const isUploading = uploadingBadgeIndex === index;

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-2 transition-shadow hover:shadow-xs"
                      >
                        {/* 序号与图标预览/上传 */}
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center font-mono text-[10px] font-semibold text-zinc-400">
                            #{index + 1}
                          </span>
                          <div
                            onClick={() => handleTriggerUploadBadge(index)}
                            title="点击上传或更换图标"
                            className="group relative flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950 transition-colors hover:border-primary"
                          >
                            {isUploading ? (
                              <Loader2 size={12} className="animate-spin text-primary" />
                            ) : badgeIcon ? (
                              <img
                                src={badgeIcon}
                                alt={badge.title}
                                className="h-5 w-5 object-contain"
                              />
                            ) : (
                              <Upload size={12} className="text-zinc-400 group-hover:text-primary" />
                            )}
                          </div>
                        </div>

                        {/* 标题输入框 */}
                        <div className="flex-[1] min-w-0">
                          <input
                            type="text"
                            value={badge.title}
                            onChange={(e) => handleUpdateBadge(index, { title: e.target.value })}
                            placeholder="展示标题 (如 Docker)"
                            className="h-7.5 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 font-medium text-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        {/* 图标地址与上传按钮 */}
                        <div className="flex-[1.5] min-w-0 flex items-center gap-1">
                          <input
                            type="text"
                            value={badge.src}
                            onChange={(e) => handleUpdateBadge(index, { src: e.target.value })}
                            placeholder="图标 URL 或上传本地图片"
                            className="h-7.5 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 font-mono text-[11px] text-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleTriggerUploadBadge(index)}
                            disabled={isUploading}
                            className="h-7.5 shrink-0 px-2 flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="上传本地图片"
                          >
                            {isUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                            <span>上传</span>
                          </button>
                        </div>

                        {/* 跳转链接 (可选) */}
                        <div className="flex-[1.5] min-w-0">
                          <input
                            type="text"
                            value={badge.link ?? ""}
                            onChange={(e) => handleUpdateBadge(index, { link: e.target.value })}
                            placeholder="跳转链接 (可选，留空不跳转)"
                            className="h-7.5 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 font-mono text-[11px] text-zinc-900 dark:text-zinc-100 placeholder:font-sans"
                            title="点击后跳转的外部链接（留空则前台点击不会跳转）"
                          />
                        </div>

                        {/* 旋转角度微调 */}
                        <div className="w-16 shrink-0 flex items-center gap-1">
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
                            className="h-7.5 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-xs outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 font-mono text-[11px] text-zinc-900 dark:text-zinc-100"
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
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBadgeDown(index)}
                            disabled={index === techStack.length - 1}
                            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="下移"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBadge(index)}
                            className="flex h-7 w-7 items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                            title="删除此徽标"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 分割线 */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4" />

            {/* 分区 4：社交链接与订阅源 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  4. 社交与订阅网络
                </h3>
                <p className="text-xs text-zinc-555 dark:text-zinc-400">
                  绑定您的社交及外部渠道，绑定的链接将实时在右侧名片和前台进行点亮。
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* GitHub */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    GitHub 主页
                  </span>
                  <div className="relative flex items-center rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus-within:ring-1.5 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white dark:bg-zinc-900/25 dark:focus-within:bg-zinc-950 transition-all duration-200">
                    <span className="flex items-center gap-1 px-2.5 py-2 bg-zinc-100/60 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 select-none">
                      <GitFork size={10} /> github.com/
                    </span>
                    <input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="username"
                      className="w-full px-2.5 h-8 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    公开联系邮箱
                  </span>
                  <div className="relative flex items-center rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus-within:ring-1.5 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white dark:bg-zinc-900/25 dark:focus-within:bg-zinc-950 transition-all duration-200">
                    <span className="flex items-center gap-1 px-2.5 py-2 bg-zinc-100/60 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 select-none">
                      <Mail size={10} /> mailto:
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-2.5 h-8 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* RSS */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    RSS 订阅源路径
                  </span>
                  <div className="relative flex items-center rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus-within:ring-1.5 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white dark:bg-zinc-900/25 dark:focus-within:bg-zinc-950 transition-all duration-200">
                    <span className="flex items-center gap-1 px-2.5 py-2 bg-zinc-100/60 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 select-none">
                      <Rss size={10} /> PATH:
                    </span>
                    <input
                      value={rss}
                      onChange={(e) => setRss(e.target.value)}
                      placeholder="/feed.xml"
                      className="w-full px-2.5 h-8 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4" />

            {/* 分区 4：页脚站点信息配置 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  4. 页脚站点信息配置
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  配置前台首页最下方页脚的动态及静态展示内容，包括建站起点计算天数与备案号。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* 页脚站点大标题 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    页脚站点大标题
                  </span>
                  <input
                    value={footerTitle}
                    onChange={(e) => setFooterTitle(e.target.value)}
                    placeholder="例如：grtsinry43's Blog."
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* 页脚站点副标题 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    页脚站点副标语
                  </span>
                  <input
                    value={footerSubtitle}
                    onChange={(e) => setFooterSubtitle(e.target.value)}
                    placeholder="例如：总之岁月漫长，然而值得等待"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* 备案号 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    站点备案号 (ICP)
                  </span>
                  <input
                    value={footerIcp}
                    onChange={(e) => setFooterIcp(e.target.value)}
                    placeholder="例如：湘ICP备2023033970号-1"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* 建站时间 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    建站起始日期 (格式：YYYY-MM-DD)
                  </span>
                  <input
                    value={footerStartDate}
                    onChange={(e) => setFooterStartDate(e.target.value)}
                    placeholder="例如：2022-06-15"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4" />

            {/* 分区 5：站点全局背景图片 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  5. 站点全局背景图片
                </h3>
                <p className="text-xs text-zinc-555 dark:text-zinc-400">
                  上传图片作为博客前台全局背景，留空则不展示背景图。上传后自动保存生效。
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-1">
                {/* 背景图预览区 */}
                <div className="flex items-center gap-4">
                  <div
                    onClick={handleBgImageClick}
                    className="relative w-[240px] h-[120px] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden cursor-pointer hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group flex items-center justify-center"
                  >
                    {bgImageUrl ? (
                      <>
                        <img
                          src={resolveUrl(bgImageUrl)}
                          alt="背景图预览"
                          className="w-full h-full object-cover"
                        />
                        {/* Hover 更换蒙层 */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <span className="text-white text-xs font-semibold flex items-center gap-1">
                            <Upload size={12} />
                            {bgImageUploading ? "上传中..." : "更换背景图片"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-zinc-400 dark:text-zinc-500 group-hover:text-primary transition-colors">
                        {bgImageUploading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Upload size={18} />
                        )}
                        <span className="text-[10px] font-semibold">
                          {bgImageUploading ? "上传中..." : "点击上传背景图片"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮列 */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleBgImageClick}
                      disabled={bgImageUploading || bgImageSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <Upload size={11} />
                      {bgImageUploading ? "上传中..." : "上传背景图"}
                    </button>
                    {bgImageUrl && (
                      <button
                        type="button"
                        onClick={handleClearBgImage}
                        disabled={bgImageSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {bgImageSaving ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <span>✕</span>
                        )}
                        {bgImageSaving ? "清除中..." : "清除背景图"}
                      </button>
                    )}
                    {bgImageUrl && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]" title={bgImageUrl}>
                        当前已设置背景图
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 隐藏的背景图文件选择 input */}
              <input
                type="file"
                ref={bgFileInputRef}
                onChange={handleBgFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* 分割线 */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4" />

            {/* 分区 6：邮件登录验证码配置 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  6. 邮箱登录验证码配置
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">
                  配置前台免密登录及注册时发送的验证码邮件主题与模板内容。
                </p>
              </div>
              <div className="flex flex-col gap-3.5 pt-1">
                {/* 邮件主题 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    邮件主题 / 标题
                  </span>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="例如：【可梵的个人博客】登录验证码"
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 h-8.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* 邮件模版 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                      邮件内容模版
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                      提示：请使用 ${"{"}code{"}"} 代替 6 位验证码
                    </span>
                  </div>
                  <textarea
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    placeholder="例如：您的验证码为：${code}，5分钟内有效。若非本人操作，请忽略此邮件。"
                    rows={3}
                    className="w-full bg-zinc-50/50 hover:bg-zinc-50/80 focus:bg-white dark:bg-zinc-900/25 dark:hover:bg-zinc-900/40 dark:focus:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* 表单底部统一操作栏 */}
          <div className="px-5 py-3 bg-zinc-50/80 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-zinc-900 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-xs text-zinc-550 dark:text-zinc-400">
              <AlertCircle size={12} />
              <span>检测到更改后会即刻点亮保存按钮</span>
            </div>
            <button
              type="submit"
              disabled={saving || !isFormDirty}
              className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer bg-primary text-white disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600 disabled:cursor-not-allowed hover:opacity-95"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              {saving ? "正在同步..." : isFormDirty ? "保存所有修改" : "所有更改已同步"}
            </button>
          </div>
        </form>


        {/* 右侧：预览与头像上传二合一名片挂件 (占 4 列) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* 一体化实景预览卡片 */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col relative group">
            
            {/* 顶层装饰渐变横幅 */}
            <div className="h-24 bg-gradient-to-r from-emerald-400/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-400/20 dark:via-teal-500/20 dark:to-indigo-500/20 border-b border-zinc-100 dark:border-zinc-900 relative">
              <span className="absolute top-3 right-3 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                LIVE CARD
              </span>
            </div>

            {/* 头像一键上传组件 - 巧妙地嵌入名片横幅交界处 */}
            <div className="-mt-10 ml-5 relative w-18 h-18 rounded-full border-2 border-white dark:border-zinc-950 overflow-hidden cursor-pointer group bg-zinc-50 dark:bg-zinc-900 shadow-sm flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={resolveUrl(avatarUrl)}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-zinc-400" />
              )}
              {/* Hover 更换头像蒙层 */}
              <div 
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] transition-opacity duration-200"
                title="点击更换形象头像"
              >
                <Upload size={10} className="mb-0.5" />
                <span>{uploading ? "..." : "修改"}</span>
              </div>
            </div>

            {/* 文件选择 input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* 名片基本信息渲染区 */}
            <div className="pt-3 px-5 pb-5 flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight truncate max-w-[150px]">
                    {nickname || "您的昵称"}
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="博客状态：在线" />
                </div>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 truncate w-full">
                  {bio || "职业头衔 / 签名未设置"}
                </p>
              </div>

              {/* 分界线与故事预览展示 */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex flex-col gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-450 uppercase tracking-widest">
                    关于我 · 故事预览
                  </span>
                  
                  {/* 第一行文案与技术栈徽标 */}
                  <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed flex items-center flex-wrap gap-1">
                    <span>{introLine1 || "🔥 暂无核心自我标签"}</span>
                    {techStack.length > 0 && (
                      <span className="inline-flex items-center translate-y-[1px] ml-1">
                        {techStack.map((item, idx) => {
                          const rotateDeg =
                            typeof item.rotate === "number" && !Number.isNaN(item.rotate)
                              ? item.rotate
                              : [-6, -4, 6, -5, -6, 4, -3][idx % 7];
                          const iconUrl = resolveUrl(item.src);
                          return (
                            <span
                              key={idx}
                              style={{
                                marginLeft: idx === 0 ? "0" : "-6px",
                                transform: `rotate(${rotateDeg}deg)`,
                              }}
                              className="group/chip relative inline-block transition-transform duration-200 hover:scale-125 hover:z-30 cursor-pointer"
                            >
                              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/chip:opacity-100 z-50 flex items-center gap-1">
                                <span>{item.title || "未命名"}</span>
                                {item.link?.trim() && <span className="text-[8px] opacity-75">↗</span>}
                              </span>
                              <span className="block size-4.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-xs overflow-hidden">
                                {iconUrl ? (
                                  <img
                                    src={iconUrl}
                                    alt={item.title}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[7px] text-zinc-400">
                                    ?
                                  </div>
                                )}
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </div>

                  {/* 第二行文案 */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed line-clamp-3 whitespace-pre-wrap min-h-[48px]">
                    {introLine2 || "在此输入您的博客详细欢迎文案与故事简介，这些信息将被高保真地渲染在博客的公开板块中。"}
                  </p>
                </div>
              </div>

              {/* 联动页脚及备案信息 */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex flex-col gap-1.5 text-[10px] text-zinc-550 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>站点名称:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-350 truncate max-w-[120px]">{footerTitle || "未设置"}</span>
                </div>
                <div className="flex justify-between">
                  <span>ICP 备案:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-350 truncate max-w-[120px]">{footerIcp || "未设置"}</span>
                </div>
              </div>

              {/* 联动社交网络状态指示器 */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-450 uppercase tracking-widest">
                  社交渠道
                </span>
                <div className="flex items-center gap-3">
                  {/* GitHub */}
                  <span 
                    className={cn(
                      "transition-all duration-200", 
                      github ? "text-zinc-800 dark:text-zinc-200 scale-100 opacity-100" : "text-zinc-300 dark:text-zinc-800 scale-95 opacity-40"
                    )}
                    title={github ? `GitHub: ${github}` : "未配置"}
                  >
                    <GitFork size={12} className={cn(github && "text-zinc-900 dark:text-zinc-100")} />
                  </span>

                  {/* Email */}
                  <span 
                    className={cn(
                      "transition-all duration-200", 
                      email ? "text-sky-500 scale-100 opacity-100" : "text-zinc-300 dark:text-zinc-800 scale-95 opacity-40"
                    )}
                    title={email ? `Email: ${email}` : "未配置"}
                  >
                    <Mail size={12} />
                  </span>

                  {/* RSS */}
                  <span 
                    className={cn(
                      "transition-all duration-200", 
                      rss ? "text-amber-500 scale-100 opacity-100" : "text-zinc-300 dark:text-zinc-800 scale-95 opacity-40"
                    )}
                    title={rss ? `RSS: ${rss}` : "未配置"}
                  >
                    <Rss size={12} />
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 头像上传的单独提示框 */}
          <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-2.5">
            <Upload size={12} className="text-zinc-400 mt-0.5 shrink-0" />
            <span className="text-xs text-zinc-550 dark:text-zinc-400 leading-normal">
              小提示：鼠标悬停在右侧卡片头像上，点击“修改”即可上传更换头像，上传后需保存左侧表单使之完全发布。
            </span>
          </div>


        </div>

      </div>
    </div>
  );
}

/** Settings 骨架屏组件 (基于高密度设计，保持与原布局结构完全一致) */
function SettingsSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto p-2 md:p-4 flex flex-col gap-5 text-left font-body animate-pulse">
      {/* 头部标题骨架 */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-4.5 h-4.5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="w-12 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 左侧大面板骨架 */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-6">
          {[1, 2, 3, 4].map((section) => (
            <div key={section} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-850 rounded" />
                <div className="h-3 w-64 bg-zinc-200 dark:bg-zinc-850 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-850 rounded" />
                  <div className="h-8.5 w-full bg-zinc-100 dark:bg-zinc-900/60 rounded-lg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-850 rounded" />
                  <div className="h-8.5 w-full bg-zinc-100 dark:bg-zinc-900/60 rounded-lg" />
                </div>
              </div>
              {section !== 4 && <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-2" />}
            </div>
          ))}
        </div>

        {/* 右侧名片骨架 */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col relative">
            <div className="h-24 bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900" />
            <div className="-mt-10 ml-5 w-18 h-18 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 shadow-sm shrink-0" />
            <div className="pt-3 px-5 pb-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-850 rounded" />
                <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-850 rounded" />
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex flex-col gap-2.5">
                <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-850 rounded" />
                <div className="h-4 w-full bg-zinc-100/50 dark:bg-zinc-900/40 rounded" />
                <div className="h-10 w-full bg-zinc-100/50 dark:bg-zinc-900/40 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
