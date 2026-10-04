# 项目名称：
Butvan Blog2.0
可梵的个人博客系统2.0

## 技术方向
- 前端使用next.js + next ui(pnpm add @heroui/styles @heroui/react)
- 后端使用 SpringBoot3.x 
- 数据库使用 postgresql

## 开发规范
- 每次完成一个任务模块之后，都需要git commit，并遵循Git规范化提交
- 整体开发需要遵循大厂开发规范
- 代码需要具备可读性、可维护性、可扩展性
- 项目目录结构严格约束，遵循大厂开发规范
- 每个函数方法，都要有中文注释说明
- 数据库版本管理采用 Flyway 规范：
  - 后端迁移 SQL 脚本存放于 `backend/blog-service/src/main/resources/db/migration` 下，作为数据库结构的唯一更新同步源。
  - 迁移脚本文件命名强制采用 `VYYYYMMDDHHMM__描述.sql` 格式（如 `V202607161900__add_user_avatar.sql`），利用具体时间戳彻底避免多人协作时的版本号冲突（注意是双下划线 `__`）。
  - 严禁修改任何已经提交并部署过的 SQL 脚本。若需要对表结构做修改或订正，必须通过新增更高版本号（时间戳）的 SQL 脚本文件来实施。
  - 本地与线上环境必须关闭持久层框架（如 Hibernate JPA）的自动建表更新功能（即 `ddl-auto: update`），统一将其设置为 `validate` 或 `none`，由 Flyway 独立接管所有结构变更。
  - `/docx/database` 仅作为系统初始 DDL 结构的归档库（存放初始 `schema.sql` 作为文档参考），不再保留任何历史增量迁移文件（如 `migration-v*.sql`），以防止版本冲突。
- 页面不要总是使用模块化布局，我不喜欢模块卡片式的布局方式
- 布局方面，我不喜欢留白太多，要紧凑一些，内容信息、功能丰富一点
- Git 分支管理与发布规范：
  - `main` 分支：作为本地联调测试与功能集成的主分支。所有已测试通过的代码在此汇总，且 `main` 必须随时保持可运行、可部署的健康状态。
  - `release` 分支：作为线上生产发布的唯一受控分支。当 `main` 分支的代码稳定且验证通过准备上线时，通过 Git 合并（Merge）到 `release` 分支并推送到远程，触发 GitHub Actions 等 CI/CD 自动构建发布。
  - 严格禁止在 `release` 分支上直接进行编码或紧急修复，以确保生产环境代码的追溯性与一致性。
  - 开发与修复实施“双轨制”分支策略，合理防范半成品代码污染主分支：
    - **大型功能 / 复杂需求开发**（如微信登录、Flyway 导入等）：必须从 `main` 拉取特性分支（格式：`feat/功能名`，如 `feat/wechat-login`）进行开发，并在本地验证通过后，通过 Squash Merge 或普通 Merge 合并回 `main` 分支。
    - **线上紧急 Bug 修复**：必须从 `main` 拉取修复分支（格式：`fix/缺陷名`，如 `fix/comment-loading`）进行修复，验证后合并回 `main`，以保证在大需求开发途中可随时切回 `main` 快速修 Bug。
    - **日常微小修改**（如文案调整、简单的样式或配置微调）：允许直接在本地 `main` 分支进行修改与提交，避免过度工程化。
- 在后端 Java 编码中，无论是注解、类名还是接口名，切勿在具体编码中直接使用全限定名（例如 `@jakarta.annotation.PostConstruct`、`java.util.TimeZone` ），必须通过 `import` 显式导入后使用简写格式。仅在同文件内存在不可避免的类名命名冲突（如同时实例化 `java.util.Date` 和 `java.sql.Date` ）等极端情况下，方可使用全限定名进行区分。


## Git 操作权限约束
- **严禁未经用户明确允许，擅自执行 `git push`、`git merge`（合并到其他分支）或任何涉及远程仓库写入的操作。**
- AI 仅允许在当前工作分支执行 `git add` 和 `git commit`（本地提交）。
- 任何需要推送到远程（`push`）、跨分支合并（`merge`）、或触发 CI/CD 流水线的操作，必须先向用户说明操作内容和目标分支，获得明确确认后方可执行。
- 违反此规则视为严重越权操作。

## 全项目语义化版本控制与发版规范
- 项目版本遵循 SemVer（`vMAJOR.MINOR.PATCH`），但**日常小修改不自动创建新版本**。
- 文案、样式、文档、内部重构及不需要单独发布的常规修复，正常提交即可；不更新版本号、不新增 `CHANGELOG.md` 发版条目，也不创建或推送版本标签。
- 由用户决定何时将一组已完成的变更打包为正式发布。只有确认要发布时，才按 SemVer 规则确定版本号：不兼容改动更新 MAJOR，新增功能更新 MINOR，兼容性缺陷修复更新 PATCH。
- 正式发布时，同步更新 `version.json`、前台 `fronted/blog-client/src/config/version.ts` 与后台 `fronted/blog-admin/src/config/version.ts`，并在 `CHANGELOG.md` 顶部记录发布日期、对比基线、发布通道、总结、分类变动、升级说明和 Commit 列表。
- GitHub Release 工作流由推送 `vX.Y.Z` 标签触发；只有用户明确安排正式发布时才创建或推送标签。

## 工作流程
每次执行编码任务时：

1. 先阅读相关文档
2. 如果项目目录变化了请同步帮我修改`DIRECTORY.md`,并附加详细文件说明。
3. 总结修改了哪些文件，以及验证结果
