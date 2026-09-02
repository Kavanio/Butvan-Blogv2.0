package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.quote.QuoteCreateDTO;
import com.butvan.blog.pojo.dto.quote.QuoteQueryDTO;
import com.butvan.blog.pojo.dto.quote.QuoteSaveDTO;
import com.butvan.blog.pojo.vo.quote.AdminQuoteVO;
import com.butvan.blog.pojo.vo.quote.QuoteVO;

/**
 * 金句留言墙业务服务接口。
 */
public interface QuoteService {

    /**
     * 分页获取前台可见的已审核金句。
     *
     * @param page 页码，1 起始
     * @param size 每页大小
     * @return 前台展示分页数据
     */
    PageResult pagePublicQuotes(Integer page, Integer size);

    /**
     * 提交一条需要审核的登录用户留言。
     *
     * @param dto 投稿内容
     * @param username 当前登录用户名或邮箱
     * @param ipAddress 客户端 IP
     * @param userAgent 客户端 User-Agent
     * @return 新建后的后台管理视图对象
     */
    AdminQuoteVO createUserQuote(QuoteCreateDTO dto, String username, String ipAddress, String userAgent);

    /**
     * 后台条件分页查询金句。
     *
     * @param queryDTO 查询条件
     * @return 后台分页数据
     */
    PageResult pageAdminQuotes(QuoteQueryDTO queryDTO);

    /**
     * 后台直接创建金句。
     *
     * @param dto 保存数据
     * @param username 当前管理员用户名
     * @return 新建后的金句
     */
    AdminQuoteVO createAdminQuote(QuoteSaveDTO dto, String username);

    /**
     * 后台编辑已有金句。
     *
     * @param id 金句主键
     * @param dto 保存数据
     * @return 更新后的金句
     */
    AdminQuoteVO updateQuote(Long id, QuoteSaveDTO dto);

    /**
     * 更新金句审核状态。
     *
     * @param id 金句主键
     * @param status 新状态
     */
    void updateQuoteStatus(Long id, String status);

    /**
     * 切换金句置顶状态。
     *
     * @param id 金句主键
     */
    void togglePinQuote(Long id);

    /**
     * 软删除金句。
     *
     * @param id 金句主键
     */
    void deleteQuote(Long id);
}
