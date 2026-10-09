package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.dto.comment.CommentCreateDTO;
import com.butvan.blog.pojo.entity.Note;
import com.butvan.blog.service.repository.NoteRepository;
import com.butvan.blog.pojo.entity.Article;
import com.butvan.blog.pojo.entity.Comment;
import com.butvan.blog.pojo.entity.CommentBan;
import com.butvan.blog.pojo.vo.comment.CommentVO;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.repository.CommentBanRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.CommentRepository;
import com.butvan.blog.service.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 评论业务服务层接口实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final CommentBanRepository commentBanRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public List<CommentVO> listCommentsByArticleId(Long articleId, String viewerName, String viewerEmail) {
        log.info("查询文章评论树: articleId={}, viewerName={}, viewerEmail={}", articleId, viewerName, viewerEmail);
        
        Specification<Comment> spec = (root, query, cb) -> {
            Predicate isApproved = cb.equal(root.get("status"), "APPROVED");
            
            Predicate isViewerComment = cb.and(
                cb.notEqual(root.get("status"), "APPROVED"),
                cb.equal(root.get("article").get("id"), articleId)
            );
            
            if (viewerEmail != null && !viewerEmail.trim().isEmpty()) {
                Predicate emailMatch = cb.equal(root.get("visitorEmail"), viewerEmail.trim());
                isViewerComment = cb.and(isViewerComment, emailMatch);
            } else {
                isViewerComment = cb.disjunction(); // 相当于 false
            }
            
            return cb.and(
                cb.equal(root.get("article").get("id"), articleId),
                cb.or(isApproved, isViewerComment)
            );
        };

        List<Comment> comments = commentRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "createdAt"));
        return buildCommentTreeFromList(comments);
    }

    @Override
    public List<CommentVO> listCommentsByNoteId(Long noteId, String viewerName, String viewerEmail) {
        log.info("查询手记评论树: noteId={}, viewerName={}, viewerEmail={}", noteId, viewerName, viewerEmail);

        Specification<Comment> spec = (root, query, cb) -> {
            Predicate isApproved = cb.equal(root.get("status"), "APPROVED");

            Predicate isViewerComment = cb.and(
                cb.notEqual(root.get("status"), "APPROVED"),
                cb.equal(root.get("note").get("id"), noteId)
            );

            if (viewerEmail != null && !viewerEmail.trim().isEmpty()) {
                Predicate emailMatch = cb.equal(root.get("visitorEmail"), viewerEmail.trim());
                isViewerComment = cb.and(isViewerComment, emailMatch);
            } else {
                isViewerComment = cb.disjunction();
            }

            return cb.and(
                cb.equal(root.get("note").get("id"), noteId),
                cb.or(isApproved, isViewerComment)
            );
        };

        List<Comment> comments = commentRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "createdAt"));
        return buildCommentTreeFromList(comments);
    }

    /**
     * 将评论实体列表组装为树形结构 VO
     */
    private List<CommentVO> buildCommentTreeFromList(List<Comment> comments) {
        Map<Long, CommentVO> voMap = comments.stream()
                .map(this::toPublicVO)
                .collect(Collectors.toMap(CommentVO::getId, vo -> vo));

        List<CommentVO> rootComments = new ArrayList<>();

        for (Comment c : comments) {
            CommentVO vo = voMap.get(c.getId());
            if (c.getParentId() == null) {
                rootComments.add(vo);
            } else {
                CommentVO parentVO = voMap.get(c.getParentId());
                if (parentVO != null) {
                    vo.setReplyTo(parentVO.getNickname());
                    CommentVO rootVO = findRootComment(vo, voMap);
                    if (rootVO != null) {
                        rootVO.getReplies().add(vo);
                    } else {
                        rootComments.add(vo);
                    }
                } else {
                    rootComments.add(vo);
                }
            }
        }

        rootComments.sort((c1, c2) -> {
            boolean p1 = c1.getIsPinned() != null && c1.getIsPinned();
            boolean p2 = c2.getIsPinned() != null && c2.getIsPinned();
            if (p1 && !p2) return -1;
            if (!p1 && p2) return 1;
            return c1.getCreatedAt().compareTo(c2.getCreatedAt());
        });

        return rootComments;
    }

    /**
     * 将单个评论实体转换为公开 VO（兼容文章与手记）
     */
    private CommentVO toPublicVO(Comment c) {
        String nickname = getDisplayNickname(c.getUser(), c.getVisitorName());
        String avatarUrl = null;
        if (c.getUser() != null) {
            avatarUrl = c.getUser().getAvatarUrl();
            if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                avatarUrl = getGravatarUrl(c.getUser().getEmail());
            }
        } else {
            avatarUrl = getGravatarUrl(c.getVisitorEmail());
        }
        boolean isAuthor = (c.getIsAuthor() != null && c.getIsAuthor()) || (c.getUser() != null && "ADMIN".equalsIgnoreCase(c.getUser().getRole()));
        return CommentVO.builder()
                .id(c.getId())
                .articleId(c.getArticle() != null ? c.getArticle().getId() : null)
                .articleTitle(c.getArticle() != null ? c.getArticle().getTitle() : null)
                .articleSlug(c.getArticle() != null ? c.getArticle().getSlug() : null)
                .noteId(c.getNote() != null ? c.getNote().getId() : null)
                .noteTitle(c.getNote() != null ? c.getNote().getTitle() : null)
                .noteSlug(c.getNote() != null ? c.getNote().getSlug() : null)
                .parentId(c.getParentId())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .nickname(nickname)
                .avatarUrl(avatarUrl)
                .visitorWebsite(c.getUser() != null ? null : c.getVisitorWebsite())
                .content(c.getContent())
                .likeCount(c.getLikeCount())
                .isAuthorReplied(c.getIsAuthorReplied())
                .isAuthor(isAuthor)
                .isPinned(c.getIsPinned() != null && c.getIsPinned())
                .status(c.getStatus())
                .userAgent(c.getUserAgent())
                .createdAt(c.getCreatedAt())
                .replies(new ArrayList<>())
                .build();
    }

    @Transactional
    @Override
    public CommentVO createComment(Long articleId, CommentCreateDTO dto, String ipAddress, String userAgent) {
        log.info("提交评论: articleId={}, visitorName={}", articleId, dto.getVisitorName());

        // 0. 检验发表人邮箱或 IP 是否在封禁黑名单中
        if (dto.getVisitorEmail() != null && commentBanRepository.existsByEmail(dto.getVisitorEmail().trim())) {
            throw new BusinessException("您的邮箱已在本站的封禁黑名单中，无法发表评论");
        }
        if (ipAddress != null && commentBanRepository.existsByIpAddress(ipAddress.trim())) {
            throw new BusinessException("您的 IP 地址已在本站的封禁黑名单中，无法发表评论");
        }

        // 1. 检验文章及是否开放评论状态
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new BusinessException("目标文章不存在"));
        
        if (!Boolean.TRUE.equals(article.getIsAllowComment())) {
            throw new BusinessException("该文章目前已关闭评论模块，无法发布评论");
        }

        // 2. 字段空校验
        if (dto.getVisitorName() == null || dto.getVisitorName().trim().isEmpty()) {
            throw new BusinessException("评论昵称不能为空");
        }
        if (dto.getVisitorEmail() == null || dto.getVisitorEmail().trim().isEmpty()) {
            throw new BusinessException("电子邮箱不能为空");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new BusinessException("评论正文内容不能为空");
        }

        // 3. 校验 parentId 关联父评论合法性
        if (dto.getParentId() != null) {
            commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new BusinessException("被回复的目标评论不存在或已被删除"));
        }

        // 查询是否有绑定的 User，如果邮箱匹配，则自动关联为注册用户评论
        User matchedUser = null;
        if (dto.getVisitorEmail() != null && !dto.getVisitorEmail().trim().isEmpty()) {
            matchedUser = userRepository.findByEmail(dto.getVisitorEmail().trim()).orElse(null);
        }

        // 校验匹配到的注册用户账号是否被禁用
        if (matchedUser != null && "DISABLED".equalsIgnoreCase(matchedUser.getStatus())) {
            throw new BusinessException("您的账号已被禁用，无法发表评论");
        }

        // 4. 构建实体类并持久化保存
        Comment comment = Comment.builder()
                .article(article)
                .parentId(dto.getParentId())
                .user(matchedUser)
                .visitorName(dto.getVisitorName().trim())
                .visitorEmail(dto.getVisitorEmail().trim())
                .visitorWebsite(dto.getVisitorWebsite() != null ? dto.getVisitorWebsite().trim() : null)
                .content(dto.getContent().trim())
                .status("APPROVED") // 默认直接通过
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .likeCount(0)
                .isAuthorReplied(false)
                .build();

        Comment saved = commentRepository.save(comment);

        // 5. 更新文章表的 comment_count 冗余计数字段
        long approvedCount = commentRepository.countByArticleIdAndStatus(articleId, "APPROVED");
        article.setCommentCount(approvedCount);
        articleRepository.save(article);

        // 6. 转换构建为当前最新保存的评论 VO 返回对象
        String avatarUrl = null;
        if (saved.getUser() != null) {
            avatarUrl = saved.getUser().getAvatarUrl();
            if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                avatarUrl = getGravatarUrl(saved.getUser().getEmail());
            }
        } else {
            avatarUrl = getGravatarUrl(saved.getVisitorEmail());
        }
        String replyToName = null;
        if (saved.getParentId() != null) {
            Comment parent = commentRepository.findById(saved.getParentId()).orElse(null);
            if (parent != null) {
                replyToName = getDisplayNickname(parent.getUser(), parent.getVisitorName());
            }
        }

        boolean isAuthor = (saved.getIsAuthor() != null && saved.getIsAuthor()) || (saved.getUser() != null && "ADMIN".equalsIgnoreCase(saved.getUser().getRole()));

        // 若不是管理员发布的评论，则触发事件通知
        if (!isAuthor) {
            String excerpt = saved.getContent();
            if (excerpt.length() > 50) {
                excerpt = excerpt.substring(0, 47) + "...";
            }
            eventPublisher.publishEvent(new com.butvan.blog.service.event.NotificationEvents.CommentCreatedEvent(
                    this,
                    getDisplayNickname(saved.getUser(), saved.getVisitorName()),
                    articleId,
                    article.getTitle(),
                    excerpt,
                    saved.getId()
            ));
        }

        return CommentVO.builder()
                .id(saved.getId())
                .articleId(saved.getArticle().getId())
                .parentId(saved.getParentId())
                .userId(saved.getUser() != null ? saved.getUser().getId() : null)
                .nickname(getDisplayNickname(saved.getUser(), saved.getVisitorName()))
                .avatarUrl(avatarUrl)
                .visitorWebsite(saved.getUser() != null ? null : saved.getVisitorWebsite())
                .content(saved.getContent())
                .likeCount(saved.getLikeCount())
                .isAuthorReplied(saved.getIsAuthorReplied())
                .isAuthor(isAuthor)
                .userAgent(saved.getUserAgent())
                .createdAt(saved.getCreatedAt())
                .replyTo(replyToName)
                .replies(new ArrayList<>())
                .build();
    }

    @Transactional
    @Override
    public CommentVO createNoteComment(Long noteId, CommentCreateDTO dto, String ipAddress, String userAgent) {
        log.info("提交手记评论: noteId={}, visitorName={}", noteId, dto.getVisitorName());

        // 0. 检验发表人邮箱或 IP 是否在封禁黑名单中
        if (dto.getVisitorEmail() != null && commentBanRepository.existsByEmail(dto.getVisitorEmail().trim())) {
            throw new BusinessException("您的邮箱已在本站的封禁黑名单中，无法发表评论");
        }
        if (ipAddress != null && commentBanRepository.existsByIpAddress(ipAddress.trim())) {
            throw new BusinessException("您的 IP 地址已在本站的封禁黑名单中，无法发表评论");
        }

        // 1. 检验手记是否存在
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new BusinessException("目标手记不存在"));

        if (!"PUBLISHED".equalsIgnoreCase(note.getStatus())) {
            throw new BusinessException("该手记未正式发布，无法发布评论");
        }

        // 2. 字段空校验
        if (dto.getVisitorName() == null || dto.getVisitorName().trim().isEmpty()) {
            throw new BusinessException("评论昵称不能为空");
        }
        if (dto.getVisitorEmail() == null || dto.getVisitorEmail().trim().isEmpty()) {
            throw new BusinessException("电子邮箱不能为空");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new BusinessException("评论正文内容不能为空");
        }

        // 3. 校验 parentId 关联父评论合法性
        String replyToName = null;
        if (dto.getParentId() != null) {
            Comment parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new BusinessException("被回复的目标评论不存在或已被删除"));
            replyToName = getDisplayNickname(parent.getUser(), parent.getVisitorName());
        }

        // 查询是否有绑定的 User，如果邮箱匹配，则自动关联为注册用户评论
        User matchedUser = null;
        if (dto.getVisitorEmail() != null && !dto.getVisitorEmail().trim().isEmpty()) {
            matchedUser = userRepository.findByEmail(dto.getVisitorEmail().trim()).orElse(null);
        }

        if (matchedUser != null && "DISABLED".equalsIgnoreCase(matchedUser.getStatus())) {
            throw new BusinessException("您的账号已被禁用，无法发表评论");
        }

        // 4. 构建实体类并持久化保存
        Comment comment = Comment.builder()
                .note(note)
                .parentId(dto.getParentId())
                .user(matchedUser)
                .visitorName(dto.getVisitorName().trim())
                .visitorEmail(dto.getVisitorEmail().trim())
                .visitorWebsite(dto.getVisitorWebsite() != null ? dto.getVisitorWebsite().trim() : null)
                .content(dto.getContent().trim())
                .status("APPROVED") // 默认直接通过
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .likeCount(0)
                .isAuthorReplied(false)
                .build();

        Comment saved = commentRepository.save(comment);

        // 5. 更新手记表的 comment_count 冗余计数字段
        refreshTargetCommentCount(saved);

        // 6. 转换构建为当前最新保存的评论 VO 返回对象
        String avatarUrl = null;
        if (saved.getUser() != null) {
            avatarUrl = saved.getUser().getAvatarUrl();
            if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                avatarUrl = getGravatarUrl(saved.getUser().getEmail());
            }
        } else {
            avatarUrl = getGravatarUrl(saved.getVisitorEmail());
        }

        boolean isAuthor = (saved.getIsAuthor() != null && saved.getIsAuthor()) || (saved.getUser() != null && "ADMIN".equalsIgnoreCase(saved.getUser().getRole()));

        // 若不是管理员发布的评论，则触发事件通知
        if (!isAuthor) {
            String excerpt = saved.getContent();
            if (excerpt.length() > 50) {
                excerpt = excerpt.substring(0, 47) + "...";
            }
            eventPublisher.publishEvent(new com.butvan.blog.service.event.NotificationEvents.CommentCreatedEvent(
                    this,
                    getDisplayNickname(saved.getUser(), saved.getVisitorName()),
                    null,
                    note.getTitle(),
                    excerpt,
                    saved.getId()
            ));
        }

        return CommentVO.builder()
                .id(saved.getId())
                .noteId(note.getId())
                .noteTitle(note.getTitle())
                .noteSlug(note.getSlug())
                .parentId(saved.getParentId())
                .userId(saved.getUser() != null ? saved.getUser().getId() : null)
                .nickname(getDisplayNickname(saved.getUser(), saved.getVisitorName()))
                .avatarUrl(avatarUrl)
                .visitorWebsite(saved.getUser() != null ? null : saved.getVisitorWebsite())
                .content(saved.getContent())
                .likeCount(saved.getLikeCount())
                .isAuthorReplied(saved.getIsAuthorReplied())
                .isAuthor(isAuthor)
                .userAgent(saved.getUserAgent())
                .createdAt(saved.getCreatedAt())
                .replyTo(replyToName)
                .replies(new ArrayList<>())
                .build();
    }

    /**
     * 辅助方法：刷新评论归属的目标（文章或手记）的 comment_count 冗余计数字段
     */
    private void refreshTargetCommentCount(Comment comment) {
        if (comment == null) return;
        if (comment.getArticle() != null) {
            Article article = comment.getArticle();
            long approvedCount = commentRepository.countByArticleIdAndStatus(article.getId(), "APPROVED");
            article.setCommentCount(approvedCount);
            articleRepository.save(article);
        } else if (comment.getNote() != null) {
            Note note = comment.getNote();
            long approvedCount = commentRepository.countByNoteIdAndStatus(note.getId(), "APPROVED");
            note.setCommentCount(approvedCount);
            noteRepository.save(note);
        }
    }

    @Transactional
    @Override
    public void likeComment(Long commentId) {
        log.info("评论被点赞: id={}", commentId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException("目标点赞评论不存在"));
        comment.setLikeCount(comment.getLikeCount() + 1);
        commentRepository.save(comment);
    }

    /**
     * 辅助算法：迭代追溯最顶级的评论
     */
    private CommentVO findRootComment(CommentVO child, Map<Long, CommentVO> voMap) {
        CommentVO current = child;
        while (current.getParentId() != null) {
            CommentVO parent = voMap.get(current.getParentId());
            if (parent == null) {
                break;
            }
            current = parent;
        }
        return current;
    }

    /**
     * 辅助算法：对邮箱地址作 MD5 处理拉取 Gravatar 随机但固定的极客风头像
     */
    private String getGravatarUrl(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] array = md.digest(email.trim().toLowerCase().getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : array) {
                sb.append(Integer.toHexString((b & 0xFF) | 0x100).substring(1, 3));
            }
            // 使用 identicon 生成极富美感的对称像素风格头像，极佳契合博客整体设计
            return "https://www.gravatar.com/avatar/" + sb.toString() + "?d=identicon";
        } catch (Exception e) {
            log.error("Gravatar 头像哈希解析失败: {}", e.getMessage());
            return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        }
    }

    @Override
    public PageResult listAdminComments(String status, String keyword, Integer page, Integer size) {
        log.info("后台查询评论列表: status={}, keyword={}, page={}, size={}", status, keyword, page, size);

        // 1. 解析分页参数 (前端传来的页码是 1-based, JPA 需要 0-based)
        int pageIndex = page != null && page > 0 ? page - 1 : 0;
        int pageSize = size != null && size > 0 ? size : 10;
        
        // 默认按创建时间降序
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        Specification<Comment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 状态筛选
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }

            // 2. 关键词模糊检索 (匹配 visitorName、visitorEmail、content 或 user.nickname)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likePattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate visitorNameLike = cb.like(cb.lower(root.get("visitorName")), likePattern);
                Predicate visitorEmailLike = cb.like(cb.lower(root.get("visitorEmail")), likePattern);
                Predicate contentLike = cb.like(cb.lower(root.get("content")), likePattern);
                Predicate userNicknameLike = cb.like(cb.lower(root.join("user", jakarta.persistence.criteria.JoinType.LEFT).get("nickname")), likePattern);

                predicates.add(cb.or(visitorNameLike, visitorEmailLike, contentLike, userNicknameLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Comment> commentPage = commentRepository.findAll(spec, pageable);

        List<CommentVO> voList = commentPage.getContent().stream()
                .map(c -> {
                    String nickname = c.getUser() != null 
                            ? (c.getUser().getNickname() != null && !c.getUser().getNickname().isBlank() ? c.getUser().getNickname() : c.getUser().getEmail()) 
                            : c.getVisitorName();
                    String avatarUrl = null;
                    if (c.getUser() != null) {
                        avatarUrl = c.getUser().getAvatarUrl();
                        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                            avatarUrl = getGravatarUrl(c.getUser().getEmail());
                        }
                    } else {
                        avatarUrl = getGravatarUrl(c.getVisitorEmail());
                    }
                    
                    String replyTo = null;
                    if (c.getParentId() != null) {
                        Comment parent = commentRepository.findById(c.getParentId()).orElse(null);
                        if (parent != null) {
                            replyTo = parent.getUser() != null 
                                    ? (parent.getUser().getNickname() != null && !parent.getUser().getNickname().isBlank() ? parent.getUser().getNickname() : parent.getUser().getEmail()) 
                                    : parent.getVisitorName();
                        }
                    }
                    boolean isAuthor = (c.getIsAuthor() != null && c.getIsAuthor()) || (c.getUser() != null && "ADMIN".equalsIgnoreCase(c.getUser().getRole()));

                    return CommentVO.builder()
                            .id(c.getId())
                            .articleId(c.getArticle() != null ? c.getArticle().getId() : null)
                            .articleTitle(c.getArticle() != null ? c.getArticle().getTitle() : null)
                            .articleSlug(c.getArticle() != null ? c.getArticle().getSlug() : null)
                            .noteId(c.getNote() != null ? c.getNote().getId() : null)
                            .noteTitle(c.getNote() != null ? c.getNote().getTitle() : null)
                            .noteSlug(c.getNote() != null ? c.getNote().getSlug() : null)
                            .parentId(c.getParentId())
                            .userId(c.getUser() != null ? c.getUser().getId() : null)
                            .nickname(nickname)
                            .avatarUrl(avatarUrl)
                            .visitorWebsite(c.getVisitorWebsite())
                            .content(c.getContent())
                            .likeCount(c.getLikeCount())
                            .isAuthorReplied(c.getIsAuthorReplied())
                            .isAuthor(isAuthor)
                            .isPinned(c.getIsPinned() != null && c.getIsPinned())
                            .replyTo(replyTo)
                            .status(c.getStatus())
                            .createdAt(c.getCreatedAt())
                            .visitorEmail(c.getVisitorEmail())
                            .ipAddress(c.getIpAddress())
                            .userAgent(c.getUserAgent())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResult.builder()
                .total(commentPage.getTotalElements())
                .page(commentPage.getNumber() + 1)
                .size(commentPage.getSize())
                .records(voList)
                .build();
    }

    @Transactional
    @Override
    public void updateCommentStatus(Long id, String status) {
        log.info("修改评论状态: id={}, status={}", id, status);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标评论不存在"));
        
        String oldStatus = comment.getStatus();
        comment.setStatus(status);
        commentRepository.save(comment);

        if (!oldStatus.equals(status)) {
            refreshTargetCommentCount(comment);
        }
    }

    @Transactional
    @Override
    public CommentVO replyComment(Long id, String content, String username) {
        log.info("管理员回复评论: id={}, username={}, content={}", id, username, content);
        
        Comment parent = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("要回复的评论不存在"));
        
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("当前登录管理员账号异常"));

        Comment reply = Comment.builder()
                .article(parent.getArticle())
                .note(parent.getNote())
                .parentId(parent.getId())
                .user(admin)
                .visitorName(admin.getNickname())
                .visitorEmail(admin.getEmail())
                .content(content.trim())
                .status("APPROVED")
                .ipAddress("127.0.0.1")
                .userAgent("System Admin Panel")
                .likeCount(0)
                .isAuthorReplied(false)
                .build();
        
        Comment savedReply = commentRepository.save(reply);

        parent.setIsAuthorReplied(true);
        commentRepository.save(parent);

        refreshTargetCommentCount(parent);

        boolean isAuthor = (savedReply.getIsAuthor() != null && savedReply.getIsAuthor()) || (savedReply.getUser() != null && "ADMIN".equalsIgnoreCase(savedReply.getUser().getRole()));
        return CommentVO.builder()
                .id(savedReply.getId())
                .articleId(savedReply.getArticle() != null ? savedReply.getArticle().getId() : null)
                .articleTitle(savedReply.getArticle() != null ? savedReply.getArticle().getTitle() : null)
                .articleSlug(savedReply.getArticle() != null ? savedReply.getArticle().getSlug() : null)
                .noteId(savedReply.getNote() != null ? savedReply.getNote().getId() : null)
                .noteTitle(savedReply.getNote() != null ? savedReply.getNote().getTitle() : null)
                .noteSlug(savedReply.getNote() != null ? savedReply.getNote().getSlug() : null)
                .parentId(savedReply.getParentId())
                .userId(admin.getId())
                .nickname(admin.getNickname())
                .avatarUrl(admin.getAvatarUrl())
                .content(savedReply.getContent())
                .likeCount(savedReply.getLikeCount())
                .isAuthorReplied(savedReply.getIsAuthorReplied())
                .isAuthor(isAuthor)
                .isPinned(savedReply.getIsPinned() != null && savedReply.getIsPinned())
                .replyTo(parent.getUser() != null ? parent.getUser().getNickname() : parent.getVisitorName())
                .status(savedReply.getStatus())
                .createdAt(savedReply.getCreatedAt())
                .build();
    }

    @Transactional
    @Override
    public void markAsAuthor(Long id, String username) {
        log.info("切换评论的博主作者身份标记: id={}, username={}", id, username);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标评论不存在"));
        
        boolean nextState = comment.getIsAuthor() == null ? true : !comment.getIsAuthor();
        comment.setIsAuthor(nextState);
        // 如果此评论是回复他人的（即有 parentId），则把原评论标记为作者已回复状态
        if (comment.getParentId() != null) {
            commentRepository.findById(comment.getParentId())
                    .ifPresent(parent -> {
                        parent.setIsAuthorReplied(nextState);
                        commentRepository.save(parent);
                    });
        }
        commentRepository.save(comment);
    }

    @Transactional
    @Override
    public void togglePinComment(Long id) {
        log.info("置顶或取消置顶评论: id={}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标评论不存在"));
        
        // 置顶状态取反，且目前只允许顶级评论置顶
        if (comment.getParentId() != null) {
            throw new BusinessException("只允许对顶级的一级评论执行置顶操作");
        }
        comment.setIsPinned(comment.getIsPinned() == null ? true : !comment.getIsPinned());
        commentRepository.save(comment);
    }

    @Transactional
    @Override
    public void banCommentAuthor(Long id) {
        log.info("封禁该评论的作者: id={}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标评论不存在"));

        String email = comment.getVisitorEmail();
        String ipAddress = comment.getIpAddress();

        // 1. 如果有邮箱，进行封禁拦截记录
        if (email != null && !email.trim().isEmpty()) {
            String trimmedEmail = email.trim();
            if (!commentBanRepository.existsByEmail(trimmedEmail)) {
                commentBanRepository.save(CommentBan.builder().email(trimmedEmail).build());
            }
            // 将同邮箱的所有评论状态一并更新为 SPAM
            List<Comment> emailComments = commentRepository.findAll((root, query, cb) -> 
                cb.equal(root.get("visitorEmail"), trimmedEmail)
            );
            for (Comment c : emailComments) {
                c.setStatus("SPAM");
                commentRepository.save(c);
            }
        }

        // 2. 如果有 IP，进行封禁拦截记录 (跳过本机回环地址)
        if (ipAddress != null && !ipAddress.trim().isEmpty() && !ipAddress.equals("127.0.0.1") && !ipAddress.equals("0:0:0:0:0:0:0:1")) {
            String trimmedIp = ipAddress.trim();
            if (!commentBanRepository.existsByIpAddress(trimmedIp)) {
                commentBanRepository.save(CommentBan.builder().ipAddress(trimmedIp).build());
            }
            // 将同 IP 的所有评论状态一并更新为 SPAM
            List<Comment> ipComments = commentRepository.findAll((root, query, cb) -> 
                cb.equal(root.get("ipAddress"), trimmedIp)
            );
            for (Comment c : ipComments) {
                c.setStatus("SPAM");
                commentRepository.save(c);
            }
        }
    }

    @Transactional
    @Override
    public void deleteComment(Long id) {
        log.info("物理删除评论: id={}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标删除评论不存在"));
        
        commentRepository.delete(comment);
        refreshTargetCommentCount(comment);
    }

    /**
     * 辅助方法：获取前台展示用的评论者昵称（自动处理已登录用户的邮箱并进行掩码脱敏）
     */
    private String getDisplayNickname(User user, String visitorName) {
        if (user != null) {
            String nick = user.getNickname();
            if (nick != null && !nick.isBlank()) {
                return maskIfEmail(nick);
            }
            return maskIfEmail(user.getEmail());
        }
        return maskIfEmail(visitorName);
    }

    /**
     * 辅助方法：判断并对邮箱字符串进行掩码脱敏（例如：wj5395@outlook.com -> wj***5@outlook.com）
     */
    private String maskIfEmail(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        if (!text.contains("@")) {
            return text;
        }
        int atIndex = text.indexOf("@");
        if (atIndex <= 0) {
            return text;
        }
        String local = text.substring(0, atIndex);
        String domain = text.substring(atIndex);
        if (local.length() <= 3) {
            return local.substring(0, 1) + "***" + domain;
        }
        return local.substring(0, 2) + "***" + local.substring(local.length() - 1) + domain;
    }
}
