package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.quote.QuoteCreateDTO;
import com.butvan.blog.pojo.dto.quote.QuoteQueryDTO;
import com.butvan.blog.pojo.dto.quote.QuoteSaveDTO;
import com.butvan.blog.pojo.entity.Quote;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.quote.AdminQuoteVO;
import com.butvan.blog.pojo.vo.quote.QuoteVO;
import com.butvan.blog.service.repository.QuoteRepository;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.service.QuoteService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 金句留言墙业务服务实现。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuoteServiceImpl implements QuoteService {

    private static final int DEFAULT_PAGE_SIZE = 12;
    private static final int MAX_PAGE_SIZE = 48;
    private static final int MAX_SUBMISSIONS_PER_TEN_MINUTES = 3;

    private final QuoteRepository quoteRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResult pagePublicQuotes(Integer page, Integer size) {
        Pageable pageable = createPageable(page, size);
        Specification<Quote> specification = (root, query, cb) -> cb.equal(root.get("status"), "APPROVED");
        Page<Quote> quotePage = quoteRepository.findAll(specification, pageable);

        return PageResult.builder()
                .total(quotePage.getTotalElements())
                .page(pageable.getPageNumber() + 1)
                .size(pageable.getPageSize())
                .records(quotePage.getContent().stream().map(this::toQuoteVO).toList())
                .build();
    }

    @Override
    @Transactional
    public AdminQuoteVO createUserQuote(QuoteCreateDTO dto, String username, String ipAddress, String userAgent) {
        User user = findActiveUser(username);
        long recentCount = quoteRepository.countByUserIdAndCreatedAtAfter(user.getId(), LocalDateTime.now().minusMinutes(10));
        if (recentCount >= MAX_SUBMISSIONS_PER_TEN_MINUTES) {
            throw new BusinessException("提交过于频繁，请十分钟后再试");
        }

        Quote quote = Quote.builder()
                .user(user)
                .content(normalizeRequired(dto.getContent(), "请写下一句想留下的话"))
                .authorName(resolveAuthorName(dto.getAuthorName(), user.getNickname(), user.getEmail()))
                .source(normalizeOptional(dto.getSource()))
                .displaySize("MEDIUM")
                .status("PENDING")
                .isPinned(false)
                .sortOrder(0)
                .ipAddress(normalizeOptional(ipAddress))
                .userAgent(truncateUserAgent(userAgent))
                .build();

        Quote savedQuote = quoteRepository.save(quote);
        log.info("登录用户投稿金句成功，quoteId={}, userId={}", savedQuote.getId(), user.getId());
        return toAdminQuoteVO(savedQuote);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult pageAdminQuotes(QuoteQueryDTO queryDTO) {
        Pageable pageable = createPageable(queryDTO.getPage(), queryDTO.getSize());
        Specification<Quote> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(queryDTO.getStatus())) {
                predicates.add(cb.equal(root.get("status"), normalizeStatus(queryDTO.getStatus())));
            }
            if (StringUtils.hasText(queryDTO.getKeyword())) {
                String keyword = "%" + queryDTO.getKeyword().trim() + "%";
                predicates.add(cb.or(
                        cb.like(root.get("content"), keyword),
                        cb.like(root.get("authorName"), keyword),
                        cb.like(root.get("source"), keyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<Quote> quotePage = quoteRepository.findAll(specification, pageable);

        return PageResult.builder()
                .total(quotePage.getTotalElements())
                .page(pageable.getPageNumber() + 1)
                .size(pageable.getPageSize())
                .records(quotePage.getContent().stream().map(this::toAdminQuoteVO).toList())
                .build();
    }

    @Override
    @Transactional
    public AdminQuoteVO createAdminQuote(QuoteSaveDTO dto, String username) {
        User admin = findActiveUser(username);
        Quote quote = Quote.builder()
                .user(admin)
                .content(normalizeRequired(dto.getContent(), "请输入金句内容"))
                .authorName(normalizeRequired(dto.getAuthorName(), "请输入展示署名"))
                .source(normalizeOptional(dto.getSource()))
                .displaySize(normalizeDisplaySize(dto.getDisplaySize()))
                .status(normalizeStatus(dto.getStatus() == null ? "APPROVED" : dto.getStatus()))
                .isPinned(Boolean.TRUE.equals(dto.getIsPinned()))
                .sortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder())
                .build();
        return toAdminQuoteVO(quoteRepository.save(quote));
    }

    @Override
    @Transactional
    public AdminQuoteVO updateQuote(Long id, QuoteSaveDTO dto) {
        Quote quote = findQuote(id);
        quote.setContent(normalizeRequired(dto.getContent(), "请输入金句内容"));
        quote.setAuthorName(normalizeRequired(dto.getAuthorName(), "请输入展示署名"));
        quote.setSource(normalizeOptional(dto.getSource()));
        quote.setDisplaySize(normalizeDisplaySize(dto.getDisplaySize()));
        quote.setStatus(normalizeStatus(dto.getStatus()));
        quote.setIsPinned(Boolean.TRUE.equals(dto.getIsPinned()));
        quote.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        return toAdminQuoteVO(quoteRepository.save(quote));
    }

    @Override
    @Transactional
    public void updateQuoteStatus(Long id, String status) {
        Quote quote = findQuote(id);
        quote.setStatus(normalizeStatus(status));
        quoteRepository.save(quote);
    }

    @Override
    @Transactional
    public void togglePinQuote(Long id) {
        Quote quote = findQuote(id);
        quote.setIsPinned(!Boolean.TRUE.equals(quote.getIsPinned()));
        quoteRepository.save(quote);
    }

    @Override
    @Transactional
    public void deleteQuote(Long id) {
        Quote quote = findQuote(id);
        quote.setDeletedAt(LocalDateTime.now());
        quoteRepository.save(quote);
    }

    /**
     * 创建具有统一排序规则的分页对象。
     */
    private Pageable createPageable(Integer page, Integer size) {
        int pageIndex = page != null && page > 0 ? page - 1 : 0;
        int pageSize = size != null && size > 0 ? Math.min(size, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        Sort sort = Sort.by(
                Sort.Order.desc("isPinned"),
                Sort.Order.desc("sortOrder"),
                Sort.Order.desc("createdAt")
        );
        return PageRequest.of(pageIndex, pageSize, sort);
    }

    /**
     * 查找当前登录且状态正常的用户。
     */
    private User findActiveUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new BusinessException("当前登录用户不存在"));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BusinessException("当前账号已被禁用，无法执行此操作");
        }
        return user;
    }

    /**
     * 查找未被软删除的金句。
     */
    private Quote findQuote(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("金句不存在或已被删除"));
    }

    /**
     * 归一化并校验必填字符串。
     */
    private String normalizeRequired(String value, String errorMessage) {
        String normalized = normalizeOptional(value);
        if (!StringUtils.hasText(normalized)) {
            throw new BusinessException(errorMessage);
        }
        return normalized;
    }

    /**
     * 去除字符串首尾空白，并将空字符串转为 null。
     */
    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    /**
     * 选择投稿展示署名，优先使用填写值，再回退用户昵称或邮箱。
     */
    private String resolveAuthorName(String inputName, String nickname, String email) {
        String authorName = normalizeOptional(inputName);
        if (StringUtils.hasText(authorName)) {
            return authorName;
        }
        if (StringUtils.hasText(nickname)) {
            return nickname.trim();
        }
        return email;
    }

    /**
     * 校验并标准化审核状态。
     */
    private String normalizeStatus(String status) {
        String normalized = normalizeRequired(status, "请选择有效审核状态").toUpperCase();
        if (!List.of("PENDING", "APPROVED", "REJECTED").contains(normalized)) {
            throw new BusinessException("审核状态无效");
        }
        return normalized;
    }

    /**
     * 校验并标准化展墙视觉字号。
     */
    private String normalizeDisplaySize(String displaySize) {
        String normalized = normalizeOptional(displaySize);
        if (normalized == null) {
            return "MEDIUM";
        }
        normalized = normalized.toUpperCase();
        if (!List.of("SMALL", "MEDIUM", "LARGE").contains(normalized)) {
            throw new BusinessException("展示字号无效");
        }
        return normalized;
    }

    /**
     * 将 User-Agent 截断到数据库允许的最大长度。
     */
    private String truncateUserAgent(String userAgent) {
        String normalized = normalizeOptional(userAgent);
        if (normalized == null) {
            return null;
        }
        return normalized.length() > 500 ? normalized.substring(0, 500) : normalized;
    }

    /**
     * 转换为前台安全视图对象。
     */
    private QuoteVO toQuoteVO(Quote quote) {
        return QuoteVO.builder()
                .id(quote.getId())
                .content(quote.getContent())
                .authorName(quote.getAuthorName())
                .source(quote.getSource())
                .displaySize(quote.getDisplaySize())
                .isPinned(quote.getIsPinned())
                .createdAt(quote.getCreatedAt())
                .build();
    }

    /**
     * 转换为后台管理视图对象。
     */
    private AdminQuoteVO toAdminQuoteVO(Quote quote) {
        User user = quote.getUser();
        return AdminQuoteVO.builder()
                .id(quote.getId())
                .content(quote.getContent())
                .authorName(quote.getAuthorName())
                .source(quote.getSource())
                .displaySize(quote.getDisplaySize())
                .status(quote.getStatus())
                .isPinned(quote.getIsPinned())
                .sortOrder(quote.getSortOrder())
                .userId(user == null ? null : user.getId())
                .userNickname(user == null ? null : user.getNickname())
                .ipAddress(quote.getIpAddress())
                .userAgent(quote.getUserAgent())
                .createdAt(quote.getCreatedAt())
                .updatedAt(quote.getUpdatedAt())
                .build();
    }
}
