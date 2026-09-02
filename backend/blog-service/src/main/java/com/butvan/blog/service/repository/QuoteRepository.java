package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;

/**
 * 金句留言墙数据访问仓储。
 */
public interface QuoteRepository extends JpaRepository<Quote, Long>, JpaSpecificationExecutor<Quote> {

    /**
     * 统计用户在指定时间后的有效投稿数量，用于限制短时间重复投稿。
     *
     * @param userId 投稿用户主键
     * @param createdAt 起始时间
     * @return 有效投稿数量
     */
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime createdAt);
}
