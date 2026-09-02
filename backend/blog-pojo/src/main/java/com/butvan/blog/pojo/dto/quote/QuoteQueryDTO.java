package com.butvan.blog.pojo.dto.quote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 金句后台分页筛选条件。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteQueryDTO {

    private Integer page; // 页码，1 起始

    private Integer size; // 每页大小

    private String keyword; // 匹配正文、署名或出处的关键词

    private String status; // 审核状态筛选
}
