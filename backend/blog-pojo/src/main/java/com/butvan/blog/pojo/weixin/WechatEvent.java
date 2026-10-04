package com.butvan.blog.pojo.weixin;

public sealed interface  WechatEvent permits WechatEvent.Scan, WechatEvent.Subscribe, WechatEvent.TextMessage, WechatEvent.Unsubscribe {


    /**
     * 开发者微信号
     */
    String fromUserName();

    /**
     * 发送者 OpenId
     */
    String toUserName();

    /**
     * 消息创建时间
     */
    int createTime();


    /**
     * 首次扫码关注事件
     */
    record Subscribe(
            String fromUserName,
            String toUserName,
            int createTime,
            String ticket,
            String eventKey
    ) implements WechatEvent {}

    /**
     * 已关注扫码事件
     */
    record Scan(
            String fromUserName,
            String toUserName,
            int createTime,
            String ticket,
            String eventKey
    ) implements WechatEvent {}

    /**
     * 用户发送文本消息
     */
    record TextMessage(
            String fromUserName,
            String toUserName,
            int createTime,
            String content,
            long msgId
    ) implements WechatEvent {}

    /**
     * 取消关注事件
     */
    record Unsubscribe(
            String fromUserName,
            String toUserName,
            int createTime
    ) implements WechatEvent{}


}
