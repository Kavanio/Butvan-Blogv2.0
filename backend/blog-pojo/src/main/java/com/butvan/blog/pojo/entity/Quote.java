package com.butvan.blog.pojo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * 金句留言墙实体，映射 blog_quote 表。
 */
@Entity
@Table(name = "blog_quote")
@SQLRestriction("deleted_at IS NULL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 金句唯一主键

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 投稿登录用户，可为空以兼容后台代录内容

    @Column(name = "content", nullable = false, length = 300)
    private String content; // 金句或留言正文

    @Column(name = "author_name", nullable = false, length = 50)
    private String authorName; // 前台展示署名

    @Column(name = "source", length = 120)
    private String source; // 可选出处

    @Column(name = "display_size", nullable = false, length = 20)
    private String displaySize; // 视觉字号：SMALL、MEDIUM、LARGE

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 审核状态：PENDING、APPROVED、REJECTED

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned; // 是否置顶

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder; // 同级展示排序

    @Column(name = "ip_address", length = 45)
    private String ipAddress; // 投稿客户端 IP 地址

    @Column(name = "user_agent", length = 500)
    private String userAgent; // 投稿客户端 User-Agent

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 最后修改时间

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // 软删除时间

    /**
     * 新建记录时补充默认值和创建时间。
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.displaySize == null) {
            this.displaySize = "MEDIUM";
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.isPinned == null) {
            this.isPinned = false;
        }
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
    }

    /**
     * 更新记录时同步修改时间。
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
