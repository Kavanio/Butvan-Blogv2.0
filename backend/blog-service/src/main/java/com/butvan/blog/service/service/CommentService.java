package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.comment.CommentCreateDTO;
import com.butvan.blog.pojo.vo.comment.CommentVO;
import java.util.List;

/**
 * 评论业务服务层逻辑接口
 */
public interface CommentService {

    /**
     * 根据文章 ID 查询并组装两级树形结构评论列表 (顶级评论 + replies)
     *
     * @param articleId 文章唯一主键 ID
     * @param viewerName 当前访客的昵称
     * @param viewerEmail 当前访客的邮箱
     * @return 组装树形化包装的评论 VO 列表
     */
    List<CommentVO> listCommentsByArticleId(Long articleId, String viewerName, String viewerEmail);

    /**
     * 前台访客/注册用户提交新评论接口
     *
     * @param articleId 评论所属的文章唯一主键 ID
     * @param dto 提交的内容表单载荷对象 (昵称、邮箱、网站、正文)
     * @param ipAddress 客户端请求提交时的 IP 地址
     * @param userAgent 客户端请求提交时的 UA 字符串说明
     * @return 生成写入成功后的评论 VO 对象
     */
    CommentVO createComment(Long articleId, CommentCreateDTO dto, String ipAddress, String userAgent);

    /**
     * 根据手记 ID 查询并组装两级树形结构评论列表 (顶级评论 + replies)
     *
     * @param noteId 手记唯一主键 ID
     * @param viewerName 当前访客的昵称
     * @param viewerEmail 当前访客的邮箱
     * @return 组装树形化包装的评论 VO 列表
     */
    List<CommentVO> listCommentsByNoteId(Long noteId, String viewerName, String viewerEmail);

    /**
     * 前台访客/注册用户提交手记新评论接口
     *
     * @param noteId 评论所属的手记唯一主键 ID
     * @param dto 提交的内容表单载荷对象 (昵称、邮箱、网站、正文)
     * @param ipAddress 客户端请求提交时的 IP 地址
     * @param userAgent 客户端请求提交时的 UA 字符串说明
     * @return 生成写入成功后的评论 VO 对象
     */
    CommentVO createNoteComment(Long noteId, CommentCreateDTO dto, String ipAddress, String userAgent);

    /**
     * 根据评论 ID 对本条评论进行点赞增加 1
     *
     * @param commentId 评论主键 ID
     */
    void likeComment(Long commentId);

    /**
     * 后台管理 - 分页检索评论列表
     *
     * @param status 状态筛选，可选值：APPROVED, PENDING, SPAM, TRASH
     * @param keyword 关键词模糊搜索，可匹配评论正文内容、发布人昵称或发布人邮箱
     * @param page 页码 (1-based)
     * @param size 每页记录数
     * @return 统一封装的 PageResult 分页响应体
     */
    com.butvan.blog.common.result.PageResult listAdminComments(String status, String keyword, Integer page, Integer size);

    /**
     * 后台管理 - 更新评论状态
     *
     * @param id 评论主键 ID
     * @param status 状态值，可选：APPROVED, PENDING, SPAM, TRASH
     */
    void updateCommentStatus(Long id, String status);

    /**
     * 后台管理 - 管理员对评论进行快捷回复
     *
     * @param id 被回复的父评论 ID
     * @param content 回复的正文内容
     * @param username 当前登录的管理员用户名
     * @return 产生保存后的评论回复 VO 对象
     */
    CommentVO replyComment(Long id, String content, String username);

    /**
     * 后台管理 - 将指定评论标记为博主本人所写
     *
     * @param id 评论 ID
     * @param username 当前登录的管理员用户名
     */
    void markAsAuthor(Long id, String username);

    /**
     * 后台管理 - 置顶或取消置顶指定评论
     *
     * @param id 评论 ID
     */
    void togglePinComment(Long id);

    /**
     * 后台管理 - 封禁评论的作者（IP 及其 邮箱）
     *
     * @param id 评论 ID
     */
    void banCommentAuthor(Long id);

    /**
     * 后台管理 - 物理彻底删除一条评论记录
     *
     * @param id 评论 ID
     */
    void deleteComment(Long id);
}
