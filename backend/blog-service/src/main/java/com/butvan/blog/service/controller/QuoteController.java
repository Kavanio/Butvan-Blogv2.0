package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.quote.QuoteQueryDTO;
import com.butvan.blog.pojo.dto.quote.QuoteSaveDTO;
import com.butvan.blog.pojo.vo.quote.AdminQuoteVO;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.service.QuoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

/**
 * 金句留言墙 API 控制器。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    /**
     * 公开分页查询已审核的金句内容。
     */
    @TrackApi("【前台】分页获取已审核金句")
    @GetMapping("/quotes")
    public Result<PageResult> pagePublicQuotes(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer size) {
        return Result.success(quoteService.pagePublicQuotes(page, size));
    }

    /**
     * 后台分页检索金句，支持状态和关键词筛选。
     */
    @TrackApi("【后台】分页检索金句留言")
    @GetMapping("/admin/quotes")
    public Result<PageResult> pageAdminQuotes(QuoteQueryDTO queryDTO) {
        return Result.success(quoteService.pageAdminQuotes(queryDTO));
    }

    /**
     * 后台直接创建一条金句。
     */
    @TrackApi("【后台】创建金句")
    @PostMapping("/admin/quotes")
    public Result<AdminQuoteVO> createAdminQuote(
            @Valid @RequestBody QuoteSaveDTO dto,
            Principal principal) {
        return Result.success(quoteService.createAdminQuote(dto, principal.getName()));
    }

    /**
     * 后台编辑一条金句。
     */
    @TrackApi("【后台】编辑金句")
    @PutMapping("/admin/quotes/{id}")
    public Result<AdminQuoteVO> updateQuote(
            @PathVariable Long id,
            @Valid @RequestBody QuoteSaveDTO dto) {
        return Result.success(quoteService.updateQuote(id, dto));
    }

    /**
     * 后台更新金句审核状态。
     */
    @TrackApi("【后台】更新金句审核状态")
    @PutMapping("/admin/quotes/{id}/status")
    public Result<Void> updateQuoteStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        quoteService.updateQuoteStatus(id, body.get("status"));
        return Result.success();
    }

    /**
     * 后台切换金句置顶状态。
     */
    @TrackApi("【后台】切换金句置顶")
    @PutMapping("/admin/quotes/{id}/pin")
    public Result<Void> togglePinQuote(@PathVariable Long id) {
        quoteService.togglePinQuote(id);
        return Result.success();
    }

    /**
     * 后台软删除金句。
     */
    @TrackApi("【后台】删除金句")
    @DeleteMapping("/admin/quotes/{id}")
    public Result<Void> deleteQuote(@PathVariable Long id) {
        quoteService.deleteQuote(id);
        return Result.success();
    }
}
