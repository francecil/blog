---
title: chromium 资源加载优先级
date: 2023-08-17 23:56:32
permalink: /pages/ddcc80/
categories: 
  - 大前端
  - 前端基础
  - 浏览器原理
  - 渲染机制
tags: 
  - 
titleTag: 草稿
---

以下这两篇文章收藏先，还未读透，后续有机会再研究
- https://zhuanlan.zhihu.com/p/30558018
- https://docs.google.com/document/d/1bCDuq9H1ih9iNjgzyAL0gpwNFiEP4TZS-YLRp_RuMlc/edit#

# FAQ

## load 结束时机是什么？怎么实现一个首页大图异步加载且不影响 load

load 结束的表现是浏览器加载按钮不再转圈

load 事件在整个页面及所有依赖资源如样式表和图片都已完成加载时触发。

无法实现一个首页大图异步加载且不影响 load，一旦图片开始加载了，必然会延后 load 时机。