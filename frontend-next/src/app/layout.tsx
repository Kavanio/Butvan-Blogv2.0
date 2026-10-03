import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "可梵的个人博客",
  description: "但行好事，莫问前程。专注于 Web 全栈开发、AI 架构探秘与后端高并发实践，记录技术思考与生活感悟。",
  icons: {
    icon: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    shortcut: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
    apple: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
  },
  openGraph: {
    title: "可梵的个人博客",
    description: "但行好事，莫问前程。专注于 Web 全栈开发、AI 架构探秘与后端高并发实践，记录技术思考与生活感悟。",
    images: [
      {
        url: "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png",
        width: 400,
        height: 400,
        alt: "可梵",
      },
    ],
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      translate="no"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans notranslate`}
    >
      <head>
        <meta name="google" content="notranslate" />
        <link rel="icon" href="https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png" />
        <link rel="apple-touch-icon" href="https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen relative antialiased transition-colors duration-200">
        <I18nProvider>
          {children}

          {/* 全局胶片噪点纹理层（0.05 不透明度消除屏幕塑料感） */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9998] opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "140px 140px",
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
