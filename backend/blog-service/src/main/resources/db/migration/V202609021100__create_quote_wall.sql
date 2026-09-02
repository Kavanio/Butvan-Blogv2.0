-- 金句留言墙：独立于文章评论的轻量内容与审核模块
CREATE TABLE "public"."blog_quote" (
  "id" bigserial PRIMARY KEY,
  "user_id" int8,
  "content" varchar(300) NOT NULL,
  "author_name" varchar(50) NOT NULL,
  "source" varchar(120),
  "display_size" varchar(20) NOT NULL DEFAULT 'MEDIUM',
  "status" varchar(20) NOT NULL DEFAULT 'PENDING',
  "is_pinned" bool NOT NULL DEFAULT false,
  "sort_order" int4 NOT NULL DEFAULT 0,
  "ip_address" varchar(45),
  "user_agent" varchar(500),
  "created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamp(6),
  CONSTRAINT "fk_blog_quote_user" FOREIGN KEY ("user_id")
    REFERENCES "public"."blog_user" ("id") ON DELETE SET NULL,
  CONSTRAINT "ck_blog_quote_display_size" CHECK ("display_size" IN ('SMALL', 'MEDIUM', 'LARGE')),
  CONSTRAINT "ck_blog_quote_status" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED'))
);

COMMENT ON TABLE "public"."blog_quote" IS '金句留言墙内容表，支持登录用户投稿与后台审核发布';
COMMENT ON COLUMN "public"."blog_quote"."user_id" IS '投稿登录用户，删除用户后保留内容并置空';
COMMENT ON COLUMN "public"."blog_quote"."content" IS '金句或留言正文';
COMMENT ON COLUMN "public"."blog_quote"."author_name" IS '前台展示署名，投稿时冻结昵称快照';
COMMENT ON COLUMN "public"."blog_quote"."source" IS '可选出处，如书名、作者或记录场景';
COMMENT ON COLUMN "public"."blog_quote"."display_size" IS '展墙视觉字号：SMALL、MEDIUM、LARGE';
COMMENT ON COLUMN "public"."blog_quote"."status" IS '审核状态：PENDING、APPROVED、REJECTED';
COMMENT ON COLUMN "public"."blog_quote"."is_pinned" IS '是否置顶展示';
COMMENT ON COLUMN "public"."blog_quote"."sort_order" IS '同级展示排序，数值越大越靠前';
COMMENT ON COLUMN "public"."blog_quote"."deleted_at" IS '软删除时间，非空时不再参与查询';

CREATE INDEX "idx_blog_quote_public_list"
  ON "public"."blog_quote" ("is_pinned" DESC, "sort_order" DESC, "created_at" DESC)
  WHERE "deleted_at" IS NULL AND "status" = 'APPROVED';

CREATE INDEX "idx_blog_quote_admin_filter"
  ON "public"."blog_quote" ("status", "created_at" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_blog_quote_user_created"
  ON "public"."blog_quote" ("user_id", "created_at" DESC)
  WHERE "deleted_at" IS NULL;

-- 前台导航与后台内容数据菜单均由数据库动态驱动。
INSERT INTO "public"."blog_navigation" (
  "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position",
  "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at"
) VALUES
  ('金句墙', NULL, 'PAGE', NULL, '/quotes', 'Quote', 'HEADER', 40, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('金句管理', (
    SELECT "id" FROM "public"."blog_navigation"
    WHERE "title" = '内容数据' AND "position" = 'ADMIN_SIDEBAR' AND "parent_id" IS NULL
    ORDER BY "id" ASC LIMIT 1
  ), 'PAGE', NULL, '/quotes', 'Quote', 'ADMIN_SIDEBAR', 25, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
