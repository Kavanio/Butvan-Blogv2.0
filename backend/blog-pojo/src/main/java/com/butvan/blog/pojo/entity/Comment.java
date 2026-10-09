package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

/**
 * 评论实体类，映射 blog_comment 表
 * 支持游客留言及登录用户的嵌套盖楼回复
 */
@Entity
@Table(name = "blog_comment")
@SQLRestriction("deleted_at IS NULL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 评论唯一主键 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private Article article; // 评论归属的文章实体关联（若属于手记评论则为 NULL）

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id")
    private Note note; // 评论归属的手记实体关联（若属于文章评论则为 NULL）

    @Column(name = "parent_id")
    private Long parentId; // 父评论 ID（NULL 表示顶级根评论）

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 注册用户评论关联（登录发表时使用，游客时为 NULL）

    @Column(name = "visitor_name", length = 50)
    private String visitorName; // 游客评论显示的昵称名称（未登录时必填）

    @Column(name = "visitor_email", length = 100)
    private String visitorEmail; // 游客邮箱（未登录时必填，用于拉取 Gravatar 头像及回复邮件通知）

    @Column(name = "visitor_website", length = 255)
    private String visitorWebsite; // 游客个人博客/站点主页 URL 地址

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content; // 评论发表的 Markdown/纯文本正文内容

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 评论状态：APPROVED(审核通过) | PENDING(待审核) | SPAM(垃圾评论) | TRASH(回收站)

    @Column(name = "ip_address", length = 45)
    private String ipAddress; // 评论发布者客户端 IP 地址（支持 IPv4 / IPv6）

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 评论发布者的浏览器 User-Agent 标头

    @Column(name = "like_count")
    private Integer likeCount; // 该评论被点赞喜欢的人数

    @Column(name = "is_author_replied")
    private Boolean isAuthorReplied; // 标识文章原作者是否已经答复了该条评论

    @Column(name = "is_author")
    private Boolean isAuthor; // 标识该评论是否由作者/站长发表或被后台标记为作者发表

    @Column(name = "is_pinned")
    private Boolean isPinned; // 是否置顶该评论

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 评论生成创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 评论编辑或状态更新时间

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // 软删除标记（删除时间）

    /**
     * 保存前的生命周期自动填充
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "APPROVED"; // 默认为 APPROVED 状态，方便测试与访客交互直接见效
        }
        if (this.likeCount == null) {
            this.likeCount = 0;
        }
        if (this.isAuthorReplied == null) {
            this.isAuthorReplied = false;
        }
        if (this.isAuthor == null) {
            this.isAuthor = this.user != null && "ADMIN".equalsIgnoreCase(this.user.getRole());
        }
        if (this.isPinned == null) {
            this.isPinned = false;
        }
    }

    /**
     * 更新前的生命周期修改时间同步
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
