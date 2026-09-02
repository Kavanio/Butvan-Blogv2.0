package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.dto.quote.QuoteSaveDTO;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
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
     * 校验管理员创建金句会按指定状态和展示信息保存。
     */
    @Test
    void createAdminQuoteShouldSavePublishedQuote() {
        User user = User.builder()
                .id(1001L)
                .nickname("可梵")
                .email("butvan@example.com")
                .status("ACTIVE")
                .build();
        QuoteSaveDTO dto = QuoteSaveDTO.builder()
                .content("日子很普通，但偶尔也会发光。")
                .authorName("可梵")
                .source("此刻")
                .displaySize("LARGE")
                .status("APPROVED")
                .isPinned(true)
                .sortOrder(10)
                .build();

        when(userRepository.findByUsername("butvan")).thenReturn(Optional.of(user));
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> {
            Quote quote = invocation.getArgument(0);
            quote.setId(2001L);
            return quote;
        });

        AdminQuoteVO result = quoteService.createAdminQuote(dto, "butvan");

        ArgumentCaptor<Quote> quoteCaptor = ArgumentCaptor.forClass(Quote.class);
        verify(quoteRepository).save(quoteCaptor.capture());
        assertEquals("APPROVED", quoteCaptor.getValue().getStatus());
        assertEquals("LARGE", quoteCaptor.getValue().getDisplaySize());
        assertEquals("可梵", quoteCaptor.getValue().getAuthorName());
        assertEquals(true, quoteCaptor.getValue().getIsPinned());
        assertEquals(2001L, result.getId());
        assertEquals("APPROVED", result.getStatus());
    }
}
