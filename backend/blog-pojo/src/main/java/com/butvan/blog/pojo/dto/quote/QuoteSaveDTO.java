package com.butvan.blog.pojo.dto.quote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 后台创建或编辑金句的请求对象。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteSaveDTO {

    @NotBlank(message = "请输入金句内容")
    @Size(max = 300, message = "金句不能超过 300 个字符")
    private String content; // 金句正文

    @NotBlank(message = "请输入展示署名")
    @Size(max = 50, message = "署名不能超过 50 个字符")
    private String authorName; // 展示署名

    @Size(max = 120, message = "出处不能超过 120 个字符")
    private String source; // 可选出处

    private String displaySize; // 视觉字号

    private String status; // 审核状态

    private Boolean isPinned; // 是否置顶

    private Integer sortOrder; // 排序值
}
