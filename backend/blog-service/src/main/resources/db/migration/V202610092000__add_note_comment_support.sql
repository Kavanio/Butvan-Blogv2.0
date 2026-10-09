-- =============================================================================
-- 迁移脚本：支持手记评论关联 (解开 article_id 必填限制，增加 note_id 关联与索引)
-- 版本：V202610092000
-- =============================================================================

-- 1. 允许 article_id 为空（当评论发表在手记下时，article_id 为 NULL）
ALTER TABLE "public"."blog_comment" ALTER COLUMN "article_id" DROP NOT NULL;

-- 2. 新增 note_id 字段以支持手记评论关联
ALTER TABLE "public"."blog_comment" ADD COLUMN IF NOT EXISTS "note_id" int8;

-- 3. 添加 note_id 外键关联约束（级联删除手记时级联清理评论）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_comment_note_id_fkey'
  ) THEN
    ALTER TABLE "public"."blog_comment"
      ADD CONSTRAINT "blog_comment_note_id_fkey"
      FOREIGN KEY ("note_id") REFERENCES "public"."blog_note" ("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

-- 4. 添加索引优化手记评论查询性能
CREATE INDEX IF NOT EXISTS "idx_blog_comment_note_id" ON "public"."blog_comment" ("note_id");

-- 5. 补充字段注释
COMMENT ON COLUMN "public"."blog_comment"."note_id" IS '评论所属手记ID（手记评论时填写，与article_id二选一）';
