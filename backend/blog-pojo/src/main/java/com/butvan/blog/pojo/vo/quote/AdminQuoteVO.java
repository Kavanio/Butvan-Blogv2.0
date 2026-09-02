package com.butvan.blog.pojo.vo.quote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 后台金句管理视图对象，包含审核与安全审计信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuoteVO {

    private Long id; // 金句主键

    private String content; // 正文

    private String authorName; // 展示署名

    private String source; // 可选出处

    private String displaySize; // 视觉字号

    private String status; // 审核状态

    private Boolean isPinned; // 是否置顶

    private Integer sortOrder; // 排序值

    private Long userId; // 投稿用户 ID

    private String userNickname; // 投稿用户昵称

    private String ipAddress; // 投稿 IP

    private String userAgent; // 投稿 UA

    private LocalDateTime createdAt; // 创建时间

    private LocalDateTime updatedAt; // 最后修改时间
}
