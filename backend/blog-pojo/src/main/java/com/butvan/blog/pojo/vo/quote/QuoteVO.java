package com.butvan.blog.pojo.vo.quote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 前台金句展示视图对象，不暴露投稿者的敏感信息。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteVO {

    private Long id; // 金句主键

    private String content; // 正文

    private String authorName; // 展示署名

    private String source; // 可选出处

    private String displaySize; // 视觉字号

    private Boolean isPinned; // 是否置顶

    private LocalDateTime createdAt; // 创建时间
}
