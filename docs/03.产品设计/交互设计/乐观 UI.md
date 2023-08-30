---
title: 乐观 UI
date: 2023-06-26 19:56:39
permalink: /pages/8d3ada/
tags: 
  - 
titleTag: 卡片
categories: 
  - 产品设计
  - 交互设计
---

乐观 UI (Optimistic UI)，即对用户交互做出实时反应，而不等待服务响应，认为绝大部分情况下服务都会执行成功。若后续服务出错，则对用户操作回滚。

乐观 UI 的常用场景有：评论交互、列表拖拽更新、文章草稿更新等

相比增加 loading 状态，对用户的反馈影响较小。

## 什么情况下使用

- 客态行为：比如给别人点赞，如果没有成功，影响也还好。但如果是保存自己的文章内容，没有成功影响很大。
- 服务稳定性（SLO）高：至少得 99.9% 的稳定性才使用此功能


## loading 状态的平衡

社交软件发送消息，通常不会使用乐观 UI，容易给用户造成困扰。

但每条消息发送时都出 loading ，即使请求在 200ms 内完成，用户也会觉得交互上存在卡顿。

有一种相对友好但成本较高的解决方案：默认不出 loading 并设置定时器，若 200ms 内还未完成请求，则开始 loading。


## 参考资料

- [2023年了你还不会乐观 UI 吗?](https://juejin.cn/post/7233809309149200445)
- [【译】使用 Meteor 构建「积极的用户界面」](https://blog.jimmylv.info/2016-02-11-optimistic-ui-with-meteor)
- [乐观 UI](https://apollographqlcn.github.io/react-docs-cn/optimistic-ui.html)