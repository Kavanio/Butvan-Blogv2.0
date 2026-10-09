package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.utils.IpUtils;
import com.butvan.blog.pojo.dto.comment.CommentCreateDTO;
import com.butvan.blog.pojo.vo.comment.CommentVO;
import com.butvan.blog.service.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * 评论业务 API 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    /**
     * 【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表
     *
     * @param articleId 文章唯一主键 ID
     * @return 统一格式 Result 包装的树形评论 VO 列表
     */
    @TrackApi("【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表")
    @GetMapping("/articles/{articleId}/comments")
    public Result<List<CommentVO>> getCommentsByArticleId(
            @PathVariable Long articleId,
            @RequestParam(required = false) String viewerName,
            @RequestParam(required = false) String viewerEmail) {
        log.info("前台获取文章评论树 API 请求: articleId={}, viewerName={}, viewerEmail={}", articleId, viewerName, viewerEmail);
        List<CommentVO> comments = commentService.listCommentsByArticleId(articleId, viewerName, viewerEmail);
        return Result.success(comments);
    }

    /**
     * 【公开前台】提交发表新评论 (支持独立评论及嵌套回复)
     *
     * @param articleId 评论所属的文章唯一主键 ID
     * @param dto 评论的载荷数据 (昵称、邮箱、网站、内容)
     * @param request HTTP Servlet 请求对象，用于解析 IP 与 UA
     * @return 统一格式 Result 包装的新增评论 VO 实体对象
     */
    @TrackApi("【公开前台】提交发表新评论 (支持独立评论及嵌套回复)")
    @PostMapping("/articles/{articleId}/comments")
    public Result<CommentVO> createComment(
            @PathVariable Long articleId,
            @RequestBody CommentCreateDTO dto,
            HttpServletRequest request) {
        log.info("前台提交文章评论 API 请求: articleId={}, visitorName={}", articleId, dto.getVisitorName());
        
        // 通过统一工具类解析客户端真实 IP
        String ipAddress = IpUtils.getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        CommentVO savedVO = commentService.createComment(articleId, dto, ipAddress, userAgent);
        return Result.success(savedVO);
    }

    /**
     * 【公开前台】获取指定手记下的所有审核通过的嵌套树形评论列表
     *
     * @param noteId 手记唯一主键 ID
     * @return 统一格式 Result 包装的树形评论 VO 列表
     */
    @TrackApi("【公开前台】获取指定手记下的所有审核通过的嵌套树形评论列表")
    @GetMapping("/notes/{noteId}/comments")
    public Result<List<CommentVO>> getCommentsByNoteId(
            @PathVariable Long noteId,
            @RequestParam(required = false) String viewerName,
            @RequestParam(required = false) String viewerEmail) {
        log.info("前台获取手记评论树 API 请求: noteId={}, viewerName={}, viewerEmail={}", noteId, viewerName, viewerEmail);
        List<CommentVO> comments = commentService.listCommentsByNoteId(noteId, viewerName, viewerEmail);
        return Result.success(comments);
    }

    /**
     * 【公开前台】提交发表手记新评论 (支持独立评论及嵌套回复)
     *
     * @param noteId 评论所属的手记唯一主键 ID
     * @param dto 评论的载荷数据 (昵称、邮箱、网站、内容)
     * @param request HTTP Servlet 请求对象，用于解析 IP 与 UA
     * @return 统一格式 Result 包装的新增评论 VO 实体对象
     */
    @TrackApi("【公开前台】提交发表手记新评论 (支持独立评论及嵌套回复)")
    @PostMapping("/notes/{noteId}/comments")
    public Result<CommentVO> createNoteComment(
            @PathVariable Long noteId,
            @RequestBody CommentCreateDTO dto,
            HttpServletRequest request) {
        log.info("前台提交手记评论 API 请求: noteId={}, visitorName={}", noteId, dto.getVisitorName());

        String ipAddress = IpUtils.getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        CommentVO savedVO = commentService.createNoteComment(noteId, dto, ipAddress, userAgent);
        return Result.success(savedVO);
    }

    /**
     * 【公开前台】评论点赞喜欢自增
     *
     * @param commentId 评论唯一主键 ID
     * @return 空成功 Result 响应
     */
    @TrackApi("【公开前台】评论点赞喜欢自增")
    @PostMapping("/comments/{commentId}/like")
    public Result<Void> likeComment(@PathVariable Long commentId) {
        log.info("前台评论点赞 API 请求: commentId={}", commentId);
        commentService.likeComment(commentId);
        return Result.success();
    }

    /**
     * 【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)
     *
     * @param status 状态筛选，可选值：APPROVED, PENDING, SPAM, TRASH
     * @param keyword 关键词模糊检索，可选
     * @param page 页码，默认 1
     * @param size 每页记录数，默认 10
     * @return 封装的 PageResult 分页结果
     */
    @TrackApi("【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)")
    @GetMapping("/admin/comments")
    public Result<PageResult> listAdminComments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        log.info("后台分页检索评论: status={}, keyword={}, page={}, size={}", status, keyword, page, size);
        PageResult result = commentService.listAdminComments(status, keyword, page, size);
        return Result.success(result);
    }

    /**
     * 【受保护后台】更新评论的审核状态
     *
     * @param id 评论 ID
     * @param body 包含状态字样的 JSON 参数包，如 {"status": "APPROVED"}
     * @return 空成功 Result 响应
     */
    @TrackApi("【受保护后台】更新评论的审核状态")
    @PutMapping("/admin/comments/{id}/status")
    public Result<Void> updateCommentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        log.info("后台修改评论状态: id={}, status={}", id, status);
        commentService.updateCommentStatus(id, status);
        return Result.success();
    }

    /**
     * 【受保护后台】快捷回复某条评论
     *
     * @param id 被回复评论的主键 ID
     * @param body 包含回复正文的参数包，如 {"content": "谢谢支持"}
     * @param principal 登录人信息凭证对象
     * @return 产生的子回复评论 VO 实体对象
     */
    @TrackApi("【受保护后台】快捷回复某条评论")
    @PostMapping("/admin/comments/{id}/reply")
    public Result<CommentVO> replyComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String content = body.get("content");
        String username = principal.getName();
        log.info("后台快捷回复评论: parentId={}, admin={}, content={}", id, username, content);
        CommentVO replyVO = commentService.replyComment(id, content, username);
        return Result.success(replyVO);
    }

    /**
     * 【受保护后台】将指定评论标记为博主本人所写
     *
     * @param id 评论 ID
     * @param principal 登录人安全凭证
     * @return 空成功 Result 响应
     */
    @TrackApi("【受保护后台】将指定评论标记为博主本人所写")
    @PutMapping("/admin/comments/{id}/author")
    public Result<Void> markAsAuthor(
            @PathVariable Long id,
            Principal principal) {
        String username = principal.getName();
        log.info("后台标记评论为作者: id={}, admin={}", id, username);
        commentService.markAsAuthor(id, username);
        return Result.success();
    }

    /**
     * 【受保护后台】彻底物理删除一条评论
     *
     * @param id 评论 ID
     * @return 空成功 Result 响应
     */
    @TrackApi("【受保护后台】彻底物理删除一条评论")
    @DeleteMapping("/admin/comments/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        log.info("后台物理彻底删除评论: id={}", id);
        commentService.deleteComment(id);
        return Result.success();
    }

    /**
     * 【受保护后台】切换评论置顶状态
     */
    @TrackApi("【受保护后台】切换评论置顶状态")
    @PutMapping("/admin/comments/{id}/pin")
    public Result<Void> togglePinComment(@PathVariable Long id) {
        log.info("后台切换评论置顶: id={}", id);
        commentService.togglePinComment(id);
        return Result.success();
    }

    /**
     * 【受保护后台】封禁该评论的作者（IP 及其 邮箱）
     */
    @TrackApi("【受保护后台】封禁该评论的作者（IP 及其 邮箱）")
    @PutMapping("/admin/comments/{id}/ban")
    public Result<Void> banCommentAuthor(@PathVariable Long id) {
        log.info("后台封禁评论作者: id={}", id);
        commentService.banCommentAuthor(id);
        return Result.success();
    }
}
