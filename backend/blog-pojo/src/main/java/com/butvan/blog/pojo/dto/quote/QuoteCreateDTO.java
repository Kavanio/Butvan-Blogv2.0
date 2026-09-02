package com.butvan.blog.pojo.dto.quote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 前台登录用户提交金句的请求对象。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteCreateDTO {

    @NotBlank(message = "请写下一句想留下的话")
    @Size(max = 300, message = "留言不能超过 300 个字符")
    private String content; // 金句或留言正文

    @Size(max = 50, message = "署名不能超过 50 个字符")
    private String authorName; // 可选展示署名，默认使用登录昵称

    @Size(max = 120, message = "出处不能超过 120 个字符")
    private String source; // 可选出处
}
