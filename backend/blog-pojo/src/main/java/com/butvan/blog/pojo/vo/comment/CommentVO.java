package com.butvan.blog.pojo.vo.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 传输给前端页面的评论视图对象 (VO)
 * 采用层级树形结构包装
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentVO {

    private Long id; // 评论唯一主键 ID

    private Long articleId; // 所属文章 ID

    private Long parentId; // 父评论 ID（NULL 表示顶级评论）

    private Long userId; // 登录评论者的用户 ID（游客时为 NULL）

    private String nickname; // 前台展示的评论者昵称名称（若为登录用户自动取其昵称，游客取 visitorName）

    private String avatarUrl; // 前台展示的头像 URL 链接（注册用户取 avatarUrl，游客自动通过 Gravatar 获取）

    private String visitorWebsite; // 评论者填写的个人主页站点

    private String content; // 评论的正文文本

    private Integer likeCount; // 评论获赞人数累计

    private Boolean isAuthorReplied; // 文章创作者（博主）是否对本条评论做出过回复

    private Boolean isAuthor; // 该评论是否为作者/站长本人所写或被后台标记为作者发表

    private Boolean isPinned; // 该评论是否被置顶

    private String replyTo; // 当前评论所回复的上一级被回复者昵称名称（如：“张三 回复 @李四”，这里为“李四”）

    private String status; // 评论的审核状态

    private String articleTitle; // 关联文章标题

    private String articleSlug; // 关联文章 Slug 标识

    private Long noteId; // 所属手记 ID（若评论归属手记则非空）

    private String noteTitle; // 关联手记标题

    private String noteSlug; // 关联手记 Slug 标识

    private LocalDateTime createdAt; // 评论发表的创建时间

    private String visitorEmail; // 访客邮箱

    private String ipAddress; // 评论者 IP

    private String userAgent; // 浏览器 UA

    private List<CommentVO> replies; // 递归嵌套的二级及后代子评论回复列表 (树状支持)
}
