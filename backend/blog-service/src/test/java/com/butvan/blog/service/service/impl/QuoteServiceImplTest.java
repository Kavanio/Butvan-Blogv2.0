package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.dto.quote.QuoteCreateDTO;
import com.butvan.blog.pojo.entity.Quote;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.quote.AdminQuoteVO;
import com.butvan.blog.service.repository.QuoteRepository;
import com.butvan.blog.service.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 金句留言墙业务单元测试，不依赖数据库、MinIO 或 WebSocket 容器。
 */
@ExtendWith(MockitoExtension.class)
class QuoteServiceImplTest {

    @Mock
    private QuoteRepository quoteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private QuoteServiceImpl quoteService;

    /**
     * 校验登录用户投稿会保存为待审核状态，并冻结其展示昵称。
     */
    @Test
    void createUserQuoteShouldCreatePendingQuote() {
        User user = User.builder()
                .id(1001L)
                .nickname("小梵")
                .email("reader@example.com")
                .status("ACTIVE")
                .build();
        QuoteCreateDTO dto = QuoteCreateDTO.builder()
                .content("日子很普通，但偶尔也会发光。")
                .source("此刻")
                .build();

        when(userRepository.findByUsername("reader@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("reader@example.com")).thenReturn(Optional.of(user));
        when(quoteRepository.countByUserIdAndCreatedAtAfter(eq(1001L), any(LocalDateTime.class))).thenReturn(0L);
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> {
            Quote quote = invocation.getArgument(0);
            quote.setId(2001L);
            quote.setCreatedAt(LocalDateTime.of(2026, 9, 2, 12, 0));
            quote.setUpdatedAt(LocalDateTime.of(2026, 9, 2, 12, 0));
            return quote;
        });

        AdminQuoteVO result = quoteService.createUserQuote(dto, "reader@example.com", "127.0.0.1", "test-agent");

        ArgumentCaptor<Quote> quoteCaptor = ArgumentCaptor.forClass(Quote.class);
        verify(quoteRepository).save(quoteCaptor.capture());
        assertEquals("PENDING", quoteCaptor.getValue().getStatus());
        assertEquals("MEDIUM", quoteCaptor.getValue().getDisplaySize());
        assertEquals("小梵", quoteCaptor.getValue().getAuthorName());
        assertEquals(2001L, result.getId());
        assertEquals("PENDING", result.getStatus());
    }

    /**
     * 校验同一用户十分钟内超过投稿上限时会被拒绝。
     */
    @Test
    void createUserQuoteShouldRejectFrequentSubmissions() {
        User user = User.builder()
                .id(1002L)
                .nickname("频繁投稿者")
                .email("limit@example.com")
                .status("ACTIVE")
                .build();
        QuoteCreateDTO dto = QuoteCreateDTO.builder()
                .content("这是一条需要被限流的留言。")
                .build();

        when(userRepository.findByUsername("limit@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("limit@example.com")).thenReturn(Optional.of(user));
        when(quoteRepository.countByUserIdAndCreatedAtAfter(eq(1002L), any(LocalDateTime.class))).thenReturn(3L);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> quoteService.createUserQuote(dto, "limit@example.com", "127.0.0.1", "test-agent"));

        assertEquals("提交过于频繁，请十分钟后再试", exception.getMessage());
    }
}
