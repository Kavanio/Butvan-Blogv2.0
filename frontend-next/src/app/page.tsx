import React from "react";
import {
  profileService,
  noteService,
  articleService,
  albumService,
  friendService,
} from "@/services";
import { HeaderSection } from "@/components/modules/HeaderSection";
import { NoteSection } from "@/components/modules/NoteSection";
import { ArticleSection } from "@/components/modules/ArticleSection";
import { PhotoSection } from "@/components/modules/PhotoSection";
import { FriendSection } from "@/components/modules/FriendSection";
import { Signature } from "@/components/Signature";

export const revalidate = 60; // 每 60 秒增量静态刷新 (ISR)

export default async function HomePage() {
  // 服务端并发获取五大板块业务数据（带自动离线兜底降级）
  const [profile, notes, articles, photos, friends] = await Promise.all([
    profileService.getProfile(),
    noteService.getPublicNotes({ page: 1, size: 6 }),
    articleService.getPublicArticles({ page: 1, size: 8 }),
    albumService.getPublicPhotos(1, 18),
    friendService.getApprovedFriends(),
  ]);

  return (
    <main className="mx-auto max-w-[40.5rem] px-6 py-12 sm:py-20">
      {/* 板块一：头部名片区 (Name + Beijing Clock + Description + Spotify) */}
      <HeaderSection profile={profile} />

      {/* 板块二：手记随笔板块 (Note Section，严格沿用原版 Notes 极客列表排版) */}
      <NoteSection notes={notes} />

      {/* 板块三：深度文章板块 (Article Section，同样沿用原版 Notes 极客列表排版) */}
      <ArticleSection articles={articles} />

      {/* 板块四：友情链接板块 (Friend Section) */}
      <FriendSection friends={friends} />

      {/* 板块五：摄影相册画板 (Photo Section，100% 真实数据交互画板) */}
      <PhotoSection photos={photos} />

      {/* 页尾右下角手写矢量签名 */}
      <footer className="mt-16 flex items-center justify-end sm:mt-12">
        <Signature />
      </footer>
    </main>
  );
}
